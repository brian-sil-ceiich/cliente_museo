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


LLAVA_API_URL = os.getenv(
    "LLAVA_API_URL",
    "http://localhost:8000/api/v1/analyze/imagen_llava",
)


LLAVA_API_KEY = os.getenv(
    "LLAVA_API_KEY"
)


@app.route("/")
def index():

    return render_template(
        "index.html"
    )


@app.post("/analyze")
def analyze():

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


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )