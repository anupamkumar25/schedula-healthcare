import sys
import json
import joblib
import pandas as pd
import os


def predict_duration(input_data):
    try:

        script_dir = os.path.dirname(os.path.abspath(__file__))

        model = joblib.load(os.path.join(script_dir, "appointment_duration_model.pkl"))
        le_specialty = joblib.load(os.path.join(script_dir, "specialty_encoder.pkl"))
        le_type = joblib.load(os.path.join(script_dir, "appointment_type_encoder.pkl"))
        le_time = joblib.load(os.path.join(script_dir, "time_encoder.pkl"))
        le_day = joblib.load(os.path.join(script_dir, "day_encoder.pkl"))

        specialty_encoded = le_specialty.transform([input_data["doctor_specialty"]])[0]
        type_encoded = le_type.transform([input_data["appointment_type"]])[0]
        time_encoded = le_time.transform([input_data["time_of_day"]])[0]
        day_encoded = le_day.transform([input_data["day_of_week"]])[0]

        features = [
            [
                specialty_encoded,
                input_data["patient_age"],
                type_encoded,
                time_encoded,
                day_encoded,
                input_data["patient_history_visits"],
            ]
        ]

        prediction = model.predict(features)[0]

        return {
            "success": True,
            "predicted_duration": round(prediction),
            "confidence": "high",
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "predicted_duration": 10,
        }


if __name__ == "__main__":

    input_json = sys.argv[1]
    input_data = json.loads(input_json)

    result = predict_duration(input_data)
    print(json.dumps(result))
