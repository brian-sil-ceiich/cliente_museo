import os
import time

import requests

from flask import (
    Flask,
    render_template,
    request,
)


app = Flask(__name__)


LLAVA_API_URL = os.getenv(
    "LLAVA_API_URL",
    "http://127.0.0.1:8000/api/v1/analyze/imagen_llava",
)

LLAVA_API_KEY = os.getenv(
    "LLAVA_API_KEY"
)


@app.route("/", methods=["GET", "POST"])
def index():

    print("Hola index")
    result = None
    error = None
    
    start = time.perf_counter()

    if request.method == "POST":

        image = request.files.get(
            "file"
        )

        prompt = request.form.get(
            "prompt",
            ""
        )

        print("Entré a servicio")

        if not image:

            error = "Debes seleccionar una imagen."

            return render_template(
                "index.html",
                result=result,
                error=error,
            )

        if not prompt.strip():

            error = "Debes escribir un prompt."

            return render_template(
                "index.html",
                result=result,
                error=error,
            )

        try:
            

            # print("Try con llava_api_url")
            # print(LLAVA_API_URL)
            # print("Try con LLAVA_API_KEY")
            # print(LLAVA_API_KEY)

            response = requests.post(
                LLAVA_API_URL,

                headers={
                    "X-API-Key": LLAVA_API_KEY
                },

                files={
                    "file": (
                        image.filename,
                        image.stream,
                        image.content_type,
                    )
                },

                data={
                    "prompt": prompt
                },

                timeout=240,
            )


            if not response.ok:
                error = (
                    f"Error de API "
                    f"({response.status_code}): "
                    f"{response.text}"
                )
            else:
                result = response.json()

        except requests.RequestException as exc:
            error = (
                "No fue posible conectar "
                f"con la API: {exc}"
            )

    elapsed_time = time.perf_counter() - start

    print(
        f"Tiempo de inferencia: {elapsed_time:.10f} segundos"
    )

    return render_template(
        "index.html",
        result=result,
        total_time= f"{elapsed_time:.10f}",
        error=error,
    )


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )