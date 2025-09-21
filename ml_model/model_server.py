from flask import Flask, request, jsonify
import joblib
import numpy as np
import panda as pd


# Load your trained ML model
model = joblib.load('model.joblib')
client = MongoClient("mongodb+srv://OneZerodha:animaZerodha@zerodhaclonecluster.6tyjhdt.mongodb.net/zerodha?retryWrites=true&w=majority&appName=ZerodhaCloneCluster")
db = client['zerodha'] 
collection = db['waterqualities']

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
         data_list = list(collection.find())  # list of dicts
         df = pd.DataFrame(data_list)
         
         features = df[['DO']].values
        # features = np.array(data['features']).reshape(1, -1)
        prediction = model.predict(features)
        return jsonify({'prediction': prediction.tolist()})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
