import streamlit as st
import google.generativeai as genai

# --- 1. CONFIGURACIÓN ---
API_KEY = "AIzaSyBUTy7W9d8VGfZ7tjI5icVw9pmUqjZa0WI" 

# Estas instrucciones las he redactado basándome en tu interfaz de "Byte-SoportePC"
SYSTEM_PROMPT = """
Eres BYTE AI, el asistente experto de 'BYTE COMPUTADORAS'. 
Tu interfaz tiene botones para: Diagnóstico, PC Lenta e Internet.
Debes responder de forma técnica pero comprensible, ayudando a reparar equipos.
Siempre prioriza la seguridad del usuario.
"""

genai.configure(api_key=API_KEY)

# --- 2. INICIALIZACIÓN DEL MODELO ---
# Usamos 'gemini-1.5-flash' que es el que usa el Project Preview por defecto
model = genai.GenerativeModel(
    model_name='gemini-1.5-flash',
    system_instruction=SYSTEM_PROMPT
)

# --- 3. INTERFAZ ---
st.set_page_config(page_title="Byte-SoportePC", page_icon="💻")
st.title("🤖 BYTE AI Support")

if "chat_session" not in st.session_state:
    # Iniciamos la sesión de chat con historial vacío
    st.session_state.chat_session = model.start_chat(history=[])

# Mostrar mensajes anteriores
for message in st.session_state.chat_session.history:
    role = "user" if message.role == "user" else "assistant"
    with st.chat_message(role):
        st.markdown(message.parts[0].text)

# --- 4. LÓGICA DE RESPUESTA ---
if prompt := st.chat_input("¿Cuál es el problema de tu PC?"):
    # Mostrar mensaje del usuario
    st.chat_message("user").markdown(prompt)
    
    try:
        # Enviar mensaje y obtener respuesta
        response = st.session_state.chat_session.send_message(prompt)
        
        # Mostrar respuesta de la IA
        with st.chat_message("assistant"):
            st.markdown(response.text)
            
    except Exception as e:
        st.error(f"Error: {e}")
