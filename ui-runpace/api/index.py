from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=[os.getenv('ALLOWED_ORIGIN', 'http://localhost:3000')])

# ==========================================
# LOAD 3-MODEL PIPELINE ASLI DARI JUPYTER
# ==========================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'models')

try:
    kmeans_model = joblib.load(os.path.join(MODEL_PATH, 'runpace_kmeans.pkl'))
    model_klasifikasi = joblib.load(os.path.join(MODEL_PATH, 'runpace_classifier.pkl'))
    model_rf = joblib.load(os.path.join(MODEL_PATH, 'runpace_regressor.pkl'))
    print("🚀 Sukses! Semua 3 Otak AI dari CSV Asli Berhasil Dimuat.")
except Exception as e:
    print(f"❌ Gagal memuat file .pkl: {str(e)}")

# Helper untuk merapikan format durasi detik menjadi jam/menit/detik teks
def format_durasi_jam(total_detik):
    jam = int(total_detik // 3600)
    sisa_detik = total_detik % 3600
    menit = int(sisa_detik // 60)
    detik = int(sisa_detik % 60)
    if jam > 0:
        return f"{jam} jam {menit} menit {detik} detik"
    return f"{menit} menit {detik} detik"

# ==========================================
# ENDPOINT API UTAMA (NAMPAN PELAYAN RESTORAN)
# ==========================================
@app.route('/api/predict', methods=['POST'])
def predict_runpace():
    try:
        # 1. Ambil data mentah yang di-input user dari Frontend UI
        data = request.json
        
        jarak_km = float(data.get('jarak_km', 5.0))
        jarak_meter = jarak_km * 1000.0
        elevasi_m = float(data.get('elevasi_m', 25.0))
        gender = data.get('gender', 'M') # M atau F
        jam_lari = int(data.get('jam_lari', 6)) # Angka jam 0 - 23
        heart_rate = float(data.get('heart_rate', 150.0))

        # 2. PROSES MODEL 2 (Classifier): Tebak Kasta Pengalaman Berdasarkan Fitur Fisik Riil
        # Urutan kolom wajib sama dengan training: ['distance (m)', 'elevation gain (m)', 'average heart rate (bpm)']
        input_class = pd.DataFrame([[jarak_meter, elevasi_m, heart_rate]], 
                                   columns=['distance (m)', 'elevation gain (m)', 'average heart rate (bpm)'])
        
        tingkat_pengalaman = model_klasifikasi.predict(input_class)[0] # Hasilnya: 'Beginner', 'Intermediate', atau 'Advanced'

        # 3. SET UP KOORDINAT DUMMY BINARY UNTUK MODEL 3 (REGRESI)
        gender_M = 1 if gender == 'M' else 0
        waktu_lari_pagi = 1 if 5 <= jam_lari < 11 else 0
        waktu_lari_siang = 1 if 11 <= jam_lari < 16 else 0
        exp_intermediate = 1 if tingkat_pengalaman == 'Intermediate' else 0
        exp_advanced = 1 if tingkat_pengalaman == 'Advanced' else 0

        # 4. PROSES MODEL 3 (Regressor): Hitung Prediksi Waktu dalam Detik
        # Urutan 8 kolom riil sesuai file model_features.pkl di Jupyter tadi:
        fitur_regresi = [
            jarak_meter, elevasi_m, gender_M, 
            waktu_lari_pagi, waktu_lari_siang, heart_rate,
            exp_intermediate, exp_advanced
        ]
        
        kolom_regresi = [
            'distance (m)', 'elevation gain (m)', 'gender_M', 
            'Waktu_Lari_Pagi', 'Waktu_Lari_Siang', 'average heart rate (bpm)',
            'Tingkat_Pengalaman_Intermediate', 'Tingkat_Pengalaman_Advanced'
        ]
        
        input_reg = pd.DataFrame([fitur_regresi], columns=kolom_regresi)
        
        # Panggil tebakan dasar model Random Forest
        prediksi_dasar_detik = model_rf.predict(input_reg)[0]

        # 5. SINKRONISASI BIAS LOGIKA (SISTEM HARMONISASI)
        # Patokan dasar kasta kecepatan lari manusia normal per km
        if tingkat_pengalaman == "Advanced":
            pace_base = 300   # 5:00 min/km
        elif tingkat_pengalaman == "Intermediate":
            pace_base = 390 # 6:30 min/km
        else:
            pace_base = 480   # 8:00 min/km
            
        durasi_logis = jarak_km * pace_base
        if gender == 'F': 
            durasi_logis *= 1.08 # Kalibrasi fisiologis gender perempuan
            
        # Formula Hybrid: 70% Logika Kecepatan Fisik + 30% Pola AI Random Forest
        prediksi_final_detik = (0.7 * durasi_logis) + (0.3 * prediksi_dasar_detik)

        # 6. HITUNG TURUNAN PACE DAN FORMAT OUTPUT
        pace_desimal = (prediksi_final_detik / 60.0) / jarak_km
        menit_pace = int(pace_desimal)
        detik_pace = int((pace_desimal - menit_pace) * 60)
        
        pace_string = f"{menit_pace}:{detik_pace:02d} /km"
        durasi_string = format_durasi_jam(prediksi_final_detik)

        # 7. Kembalikan paket bungkusan JSON ke Frontend UI
        return jsonify({
            'status': 'success',
            'hasil': {
                'tingkat_pengalaman': tingkat_pengalaman,
                'rekomendasi_pace': pace_string,
                'estimasi_durasi': durasi_string,
                'total_detik': prediksi_final_detik
            }
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f"Ada kendala di server backend: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)