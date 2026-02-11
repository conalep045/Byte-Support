import streamlit as st
import google.generativeai as genai

st.title("Prueba de Conexión Byte-AI")

# Pon tu llave aquí
api_key = "AIzaSyBUTy7W9d8VGfZ7tjI5icVw9pmUqjZa0WI"

if st.button("Probar Conexión ahora"):
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        # Intentamos un saludo súper simple
        response = model.generate_content("Hola, di 'Conectado'")
        st.success(f"¡Respuesta recibida!: {response.text}")
    except Exception as e:
        st.error("Fallo total de conexión")
        st.exception(e) # Esto nos dirá el nombre real del error
