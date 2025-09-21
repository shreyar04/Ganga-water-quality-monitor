import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from statsmodels.tsa.arima.model import ARIMA
import warnings
warnings.filterwarnings('ignore')

def get_ensemble_forecast(historical_data):
    """
    Trains an ARIMA and RandomForest model on the water quality dataset and
    provides a 3-day ensemble forecast for DO (Dissolved Oxygen) levels.
    
    Args:
        historical_data (list): A list of dictionaries containing historical
                                water quality data.
                                
    Returns:
        list: A list of 3 floating-point numbers representing the forecasted
              DO levels for the next three days.
    """
    try:
        # Load the full dataset to train the models
        data = pd.read_csv('data/waterquality.csv', encoding='latin1')
        
        # Preprocess the data
        data['Date'] = pd.to_datetime(data['Date'])
        data.set_index('Date', inplace=True)
        data = data.sort_index()
        
        # Add the new historical data from the API request to the dataset
        historical_df = pd.DataFrame(historical_data)
        historical_df['Date'] = pd.to_datetime(historical_df['Date'])
        historical_df.set_index('Date', inplace=True)
        data = pd.concat([data, historical_df])
        
        # Isolate the target variable (DO)
        do_data = data[['DO']]
        
        # --- RandomForest Model Training and Forecasting ---
        
        # Feature engineering for time series
        do_data['lag_1'] = do_data['DO'].shift(1)
        do_data['lag_2'] = do_data['DO'].shift(2)
        do_data['lag_3'] = do_data['DO'].shift(3)
        do_data = do_data.dropna()
        
        X = do_data[['lag_1', 'lag_2', 'lag_3']]
        y = do_data['DO']
        
        # Train the RandomForest model on the full dataset
        rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        rf_model.fit(X, y)
        
        # Get the last 3 data points to make the next 3 predictions
        last_values = do_data.tail(3)[['DO', 'lag_1', 'lag_2']].values
        
        # Forecast 3 steps ahead
        rf_forecasts = []
        last_3_preds = list(last_values[-1])
        for _ in range(3):
            # The input for the next prediction is the last 3 forecasted values
            next_pred = rf_model.predict(np.array([last_3_preds[-3:]]))[0]
            rf_forecasts.append(next_pred)
            last_3_preds.append(next_pred)
            
        rf_future = np.array(rf_forecasts)

        # --- ARIMA Model Training and Forecasting ---
        
        # Train the ARIMA model on the full DO series
        arima_model = ARIMA(data['DO'], order=(5, 1, 0))
        arima_fit = arima_model.fit()
        
        # Forecast 3 steps ahead
        arima_future = arima_fit.forecast(steps=3)
        
        # --- Ensemble Forecast ---
        
        # Combine the two forecasts by averaging them
        ensemble_future = (rf_future + arima_future.values) / 2
        
        # Return the forecast as a list
        return ensemble_future.tolist()

    except FileNotFoundError:
        print("Error: The 'waterquality.csv' file was not found. Please ensure it is in the 'data' folder inside the 'backend' folder.")
        return []
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return []
