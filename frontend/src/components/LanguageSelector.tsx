import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const LanguageSelector = () => {
    const { i18n, t } = useTranslation();

    const languages = [
        { code: "en", label: "English", nativeLabel: "English" },
        { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
    ];

    const handleLanguageChange = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
    };

    return (
        <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32 h-8 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {languages.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                            {language.nativeLabel}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
