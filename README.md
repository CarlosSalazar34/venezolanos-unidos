<div align="center">
  <img src="frontend/public/logo/logoVUBlack.png" width="140" alt="Logo de Venezolanos Unidos"/>
  <h1>Venezolanos Unidos 🇻🇪</h1>
  <p><em>En tiempos de crisis, la solidaridad y la tecnología se unen para salvar vidas.</em></p>
</div>

---

## 💛 Nuestro Propósito

*"La situación que estamos viviendo es demasiado fuerte, desgarradora. He hecho todo lo que ha estado a mi alcance para poder ayudar: aportando dinero, recolectando medicinas, moviendo recursos... y todavía, en el fondo, siento que no he hecho suficiente. La impotencia ante tanta necesidad es agotadora.*

*Por eso creé esta plataforma. Nace de la urgencia de hacer más sencilla la búsqueda de recursos y de consolidar todas esas iniciativas increíbles que ya están dispersas por ahí. Aparte de eso, logré limpiar y unificar la data de nuestros heridos, con la única esperanza de ayudar, de alguna forma, a que sus familiares puedan por fin conseguirlos y volver a abrazarlos.*

*Aporto este grano de arena esperando que de verdad pueda aliviar el dolor de alguien.*

***Te amo Venezuela, estoy y siempre estaré contigo.***"

---

## 🚀 Funcionalidades Principales

Hemos desarrollado una plataforma integral para atender la emergencia desde múltiples ángulos, con un diseño moderno, intuitivo y resiliente:

### 🔍 Buscador Nacional de Pacientes
- **Consolidación Masiva**: Integramos y limpiamos de manera automatizada miles de registros de Excel, Google Sheets y PDFs provenientes de hospitales y refugios, eliminando datos basura y unificando todo en una base de datos central en la nube (PostgreSQL en Railway).
- **Búsqueda Inteligente**: Permite buscar a cualquier persona ingresada, de alta o fallecida utilizando su Cédula de Identidad o combinaciones de nombre y apellido, mostrando de inmediato en qué hospital o zona se encuentra.

### 📊 Dashboard de Impacto
- **Métricas en Tiempo Real**: Un panel de control alimentado por *Recharts* que muestra la cantidad de pacientes registrados, el total de centros de salud activos y gráficos detallados sobre la ocupación (Top 5 hospitales más llenos).

### 📝 Reporte Manual de Familiares
- **Formulario Abierto**: Los rescatistas o familiares en la calle pueden ingresar manualmente a pacientes que acaban de llegar a un centro de salud, inyectando la información directamente a la base de datos nacional en segundos, sin necesidad de esperar reportes de Excel.

### 🗣️ Red de Traductores Voluntarios
- **Conectando al Mundo**: Una red para que personas bilingües/multilingües se ofrezcan como voluntarios para traducir (ej. comunicando a rescatistas internacionales con locales).
- **Directorio Interactivo**: Los rescatistas pueden buscar por idioma y presionar un botón para contactar al voluntario directamente a través de **WhatsApp**.
- **Privacidad Controlada**: Los traductores protegen su registro con un PIN de seguridad de 4 dígitos, lo que les permite borrarse de la red cuando ya no estén disponibles, sin necesidad de crear cuentas complejas.

### 🤖 Chatbot de Asistencia Resiliente
- Un asistente inteligente configurado para orientar a las personas sobre dónde buscar ayuda o encontrar centros de acopio. 
- **Sistema Fallback Anti-Bloqueos**: Si los servicios de Inteligencia Artificial (OpenAI) están bloqueados regionalmente o fallan, el sistema local entra en acción leyendo palabras clave de emergencia para no dejar nunca a un usuario sin respuesta.

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js (React), TailwindCSS, Framer Motion, Recharts, Lucide Icons.
- **Backend**: FastAPI (Python), SQLAlchemy, Pandas (para limpieza extrema de datos).
- **Base de Datos**: PostgreSQL (alojado en Railway para disponibilidad global).
- **Despliegue**: Preparado para Vercel (Frontend) y Railway/Render (Backend).

---

> *"Mucha gente pequeña, en lugares pequeños, haciendo cosas pequeñas, puede cambiar el mundo."*  
> **¡Gracias a todos los voluntarios que hacen esto posible!**