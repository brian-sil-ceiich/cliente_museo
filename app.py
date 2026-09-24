import os
import time

import requests

from flask import (
    Flask,
    render_template,
    request,
    jsonify,
)

from urllib.parse import urlparse


app = Flask(__name__)

IMAGE_FOLDER = os.path.join(
    app.static_folder,
    "images"
)

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp"
}

LLAVA_API_URL = os.getenv(
    "LLAVA_API_URL",
    "http://132.248.159.187/api/v1/analyze/imagen_llava",
)

FEEDBACK_API_URL = os.getenv(
    "FEEDBACK_API_URL",
    "http://132.248.159.187/api/v1/analyze/feedback",
)

LLAVA_API_KEY = os.getenv(
    "LLAVA_API_KEY"
)

def get_images():
    images = []

    for filename in os.listdir(IMAGE_FOLDER):

        filepath = os.path.join(
            IMAGE_FOLDER,
            filename
        )

        # Ignorar carpetas
        if not os.path.isfile(filepath):
            continue

        # Obtener extensión
        extension = os.path.splitext(
            filename
        )[1].lower()

        # Solo imágenes
        if extension not in ALLOWED_EXTENSIONS:
            continue

        # Fecha de modificación
        modification_date = os.path.getmtime(
            filepath
        )

        images.append({
            "filename": filename,
            "date": modification_date
        })

    # Más reciente primero
    images.sort(
        key=lambda image: image["date"],
        reverse=True
    )

    return images


@app.route("/")
def index():

    return render_template(
        "index.html"
    )

@app.route("/analizador")
def analizador():
    images = get_images()
    return render_template("analizador.html", images=images)

@app.post("/analyze")
def analyze():

    print("Entra a endpoint")
    data = request.get_json()

    start = time.perf_counter()

    if not data:

        return jsonify({
            "error": "No se recibieron datos."
        }), 400


    image_url = data.get(
        "image"
    )


    prompt = data.get(
        "prompt",
        ""
    )


    if not image_url:

        return jsonify({
            "error": "No se seleccionó una imagen."
        }), 400


    if not prompt.strip():

        return jsonify({
            "error": "El prompt no puede estar vacío."
        }), 400


    # ==========================================
    # SEGURIDAD:
    # solo permitir imágenes locales
    # del carrusel
    # ==========================================

    if not image_url.startswith(
        "/static/images/"
    ):

        return jsonify({
            "error": "Imagen no válida."
        }), 400


    # ==========================================
    # CONSTRUIR URL DE LA IMAGEN
    # ==========================================

    image_path = os.path.join(
        app.static_folder,
        image_url.replace(
            "/static/",
            ""
        )
    )

    if not os.path.isfile(
        image_path
    ):

        return jsonify({
            "error": "La imagen no existe."
        }), 404

    print("Antes del Try")
    try:

        with open(
            image_path,
            "rb"
        ) as image_file:

            response = requests.post(

                LLAVA_API_URL,

                headers={
                    "X-API-Key":
                        LLAVA_API_KEY
                },

                files={
                    "file": (
                        os.path.basename(
                            image_path
                        ),

                        image_file,
                        "image/jpeg"
                    )
                },

                data={
                    "prompt": prompt
                },
                timeout=240,
            )

        if not response.ok:
            

            return jsonify({
                "error":
                    response.text
            }), response.status_code

        client_time = time.perf_counter() - start

        result = response.json()

        result["client_time"] = round(client_time,10)

        return jsonify(
            result
        )


    except requests.RequestException as exc:

        return jsonify({
            "error":
                f"No fue posible conectar con la API: {exc}"
        }), 502
    
    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar LLaVA: {exc}",
        )


@app.route("/analyze/feedback", methods=["POST"])
def analyze_feedback():

    print("Entra a feed de app.py")
    id_peticion = request.form.get("id_peticion")
    edad = request.form.get("edad")
    emocion = request.form.get("emocion")
    profesion = request.form.get("profesion")

    print("ID petición:", id_peticion)
    print("Feedback edad:", edad)
    print("Feedback emoción:", emocion)
    print("Feedback profesión:", profesion)

    # Guardar en BD...
    print("Antes del Try")
    try:
        response = requests.post(

            FEEDBACK_API_URL,

            headers={
                "X-API-Key":
                    LLAVA_API_KEY
            },
            data={
                "id_peticion": id_peticion,
                "edad": edad,
                "emocion": emocion,
                "profesion": profesion
            },
            timeout=240,
        )

        if not response.ok:            

            return jsonify({
                "error":
                    response.text
            }), response.status_code

    except requests.RequestException as exc:
    
            return jsonify({
                "error":
                    f"No fue posible conectar con la API: {exc}"
            }), 502
        
    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar LLaVA: {exc}",
        )
    

    return jsonify({
        "success": True,
        "message": "Feedback guardado correctamente"
    })


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )