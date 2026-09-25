// ==========================================
// ELEMENTOS
// ==========================================

const feedbackForm =
    document.getElementById(
        "feedback-form"
    );


const feedbackButton =
    document.getElementById(
        "feedback-button"
    );


const previewContainer =
    document.getElementById(
        "preview-container"
    );


const imagePreview =
    document.getElementById(
        "image-preview"
    );

//BAMS Descomentar en caso de que quieran enviar prompt
const promptInput =
    document.getElementById(
        "prompt"
    );


const analyzeButton =
    document.getElementById(
        "analyze-button"
    );


const analysisSection =
    document.getElementById(
        "analysis-section"
    );


const loading =
    document.getElementById(
        "loading"
    );


const errorContainer =
    document.getElementById(
        "error"
    );


const resultContainer =
    document.getElementById(
        "result-container"
    );


const summary =
    document.getElementById(
        "summary"
    );


const ollamaTime =
    document.getElementById(
        "ollama-time"
    );


const clientTime =
    document.getElementById(
        "client-time"
    );

// ==========================================
// MODAL DE ANÁLISIS
// ==========================================

const analysisModal =
    document.getElementById(
        "analysis-modal"
    );


const modalProcessing =
    document.getElementById(
        "modal-processing"
    );


const modalResult =
    document.getElementById(
        "modal-result"
    );


const analysisVideo =
    document.getElementById(
        "analysis-video"
    );


const modalSummary =
    document.getElementById(
        "modal-summary"
    );


const modalOllamaTime =
    document.getElementById(
        "modal-ollama-time"
    );


// const closeAnalysisModal =
//     document.getElementById(
//         "close-analysis-modal"
//     );


const analysisModalOverlay =
    document.getElementById(
        "analysis-modal-overlay"
    );


// const jsonResult =
//     document.getElementById(
//         "json-result"
//     );


const gobackContainer =
    document.getElementById(
        "goback-container"
    );


const gobackButton =
    document.getElementById(
        "goback-button"
    );


// ==========================================
// ESTADO
// ==========================================

let selectedImage = null;
let id_peticion = null;


// ==========================================
// ESTADO DEL MODAL
// ==========================================

let videoFinished = false;
let analysisFinished = false;
let analysisData = null;
let minimumTimeFinished = false;
let analysisStartTime = null;
const MINIMUM_ANALYSIS_TIME = 64000;



// ==========================================
// SELECCIONAR IMAGEN
// ==========================================

function selectImage(image) {

    const previousSelected =
        document.querySelector(
            ".gallery-image.selected"
        );


    if (previousSelected) {

        previousSelected.classList.remove(
            "selected"
        );

    }


    image.classList.add(
        "selected"
    );


    selectedImage = image;


    imagePreview.src =
        image.src;


    previewContainer.hidden =
        false;

}

function setupImageSelection() {

    const images =
        document.querySelectorAll(
            ".gallery-image"
        );


    images.forEach(
        image => {

            image.addEventListener(
                "click",
                () => {

                    selectImage(image);

                }
            );

        }
    );

}



// ==========================================
// CONFIGURACIÓN DE GRILLA
// ==========================================

const IMAGES_PER_PAGE = 14;

const imageGrid =
    document.getElementById(
        "image-grid"
    );

const pagination =
    document.getElementById(
        "pagination"
    );

let currentPage = 1;

// ==========================================
// CREAR LA PAGINACIÓN DE LA GRILLA
// ==========================================
function setupPagination() {

    const images =
        Array.from(
            imageGrid.querySelectorAll(
                ".image-card"
            )
        );

    const totalPages =
        Math.ceil(
            images.length /
            IMAGES_PER_PAGE
        );


    function showPage(page) {

        currentPage = page;

        const start =
            (page - 1) *
            IMAGES_PER_PAGE;

        const end =
            start +
            IMAGES_PER_PAGE;


        images.forEach(
            (image, index) => {

                image.hidden =
                    !(
                        index >= start &&
                        index < end
                    );

            }
        );


        renderPagination(
            totalPages
        );

    }


    function renderPagination(
        totalPages
    ) {

        pagination.innerHTML = "";


        if (totalPages <= 1) {
            return;
        }


        // BOTÓN ANTERIOR

        const previous =
            document.createElement(
                "button"
            );

        previous.textContent =
            "‹";

        previous.className =
            "pagination-button";

        previous.disabled =
            currentPage === 1;

        previous.addEventListener(
            "click",
            () => {

                if (
                    currentPage > 1
                ) {

                    showPage(
                        currentPage - 1
                    );

                }

            }
        );

        pagination.appendChild(
            previous
        );


        // NÚMEROS DE PÁGINA

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            const button =
                document.createElement(
                    "button"
                );

            button.textContent =
                page;

            button.className =
                "pagination-button";


            if (
                page === currentPage
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.addEventListener(
                "click",
                () => {

                    showPage(page);

                }
            );


            pagination.appendChild(
                button
            );

        }


        // BOTÓN SIGUIENTE

        const next =
            document.createElement(
                "button"
            );

        next.textContent =
            "›";

        next.className =
            "pagination-button";

        next.disabled =
            currentPage === totalPages;


        next.addEventListener(
            "click",
            () => {

                if (
                    currentPage <
                    totalPages
                ) {

                    showPage(
                        currentPage + 1
                    );

                }

            }
        );


        pagination.appendChild(
            next
        );

    }


    showPage(1);
}



// ==========================================
// MOSTRAR ERROR
// ==========================================

function showError(message) {

    errorContainer.textContent =
        message;


    errorContainer.hidden =
        false;

}


// ==========================================
// OCULTAR ERROR
// ==========================================

function hideError() {

    errorContainer.textContent =
        "";

    errorContainer.hidden =
        true;

}


// ==========================================
// MOSTRAR LOADING
// ==========================================

function showLoading() {

    // Ocultar únicamente el carrusel
    carousel.hidden = true;

    // Ocultar el botón
    analyzeButton.hidden = true;

    // Mantener visible la vista previa
    previewContainer.hidden = false;

    // Ocultar resultado anterior
    resultContainer.hidden = true;

    // Mostrar loading
    loading.hidden = false;

    // Ocultar contenedor para el inicio
    gobackContainer.hidden = true;

    // Ocultar el botón de Inicio
    gobackButton.hidden = true;

}


// ==========================================
// OCULTAR LOADING
// ==========================================

function hideLoading() {

    loading.hidden =
        true;

}

// ==========================================
// VIDEO TERMINÓ
// ==========================================

analysisVideo.addEventListener(
    "ended",
    () => {

        console.log(
            "El video terminó."
        );

        videoFinished = true;

        checkAnalysisFinished();

    }
);

// ==========================================
// ABRIR MODAL
// ==========================================

function openAnalysisModal() {
    analysisModal.hidden = false;
    modalProcessing.hidden = false;
    modalResult.hidden = true;

    // Reiniciar estado
    videoFinished = false;
    analysisFinished = false;
    analysisData = null;
    minimumTimeFinished = false;

    // Registrar inicio
    analysisStartTime =
        Date.now();

    // Reiniciar video
    analysisVideo.currentTime = 0;
    analysisVideo.play().catch(() => {});

    // Bloquear scroll
    document.body.style.overflow = "hidden";


    // ======================================
    // ESPERAR xsss SEGUNDOS que se configuren
    // ======================================

    setTimeout(
        () => {
            minimumTimeFinished = true;
            //Se pone para que después del timeout se pueda mostrar el resultado si ya regresó del servicio
            videoFinished = true;

            // Cortar video
            analysisVideo.pause();

            // Verificar si LLaVA ya respondió
            checkAnalysisReady();
        },
        MINIMUM_ANALYSIS_TIME
    );
    
}

// ==========================================
// VERIFICAR SI SE PUEDE MOSTRAR RESULTADO
// ==========================================

function checkAnalysisReady() {

    if (
        minimumTimeFinished &&
        analysisFinished
    ) {

        showModalResult(
            analysisData
        );

    }

}

// ==========================================
// VERIFICAR SI YA TERMINÓ TODO
// ==========================================

function checkAnalysisFinished() {

    if (
        videoFinished &&
        analysisFinished
    ) {

        showModalResult(
            analysisData
        );

    }

}

function formatearTextoResultado(texto){
    const campos = ['EDAD', 'EMOCIÓN', 'PROFESIÓN'];

    // Busca cada campo y captura su contenido hasta el siguiente número.
    const regex = /(\d+)\.\s*(EDAD|EMOCIÓN|PROFESIÓN)\s*-\s*(.*?)(?=\s*\d+\.\s*(?:EDAD|EMOCIÓN|PROFESIÓN)\s*-|$)/gis;

    const resultados = [];
    let match;

    while ((match = regex.exec(texto)) !== null) {
        const campo = match[2].toUpperCase();
        const contenido = match[3].trim();

        resultados.push(`${match[1]}. ${campo} - ${contenido}`);
        console.log(
            "Entra a While de formatear"
        );
    }

    // Si no encontró ninguno de los campos, no hacer nada
    if (resultados.length === 0) {
        console.log(
            "No encontró los textos"
        );
        return texto;
    }

    resultados.forEach((elemento, indice) => {
        console.log(`Parrafo: ${elemento}, Índice: ${indice}`);
    });

    return resultados.join('\n');
}


// ==========================================
// MOSTRAR RESULTADO EN MODAL
// ==========================================

function showModalResult(data) {

    modalProcessing.hidden = true;
    modalResult.hidden = false;

    modalSummary.textContent = formatearTextoResultado(data.analysis);

    modalOllamaTime.textContent =
        parseInt(parseFloat(data.ollama_time));

        // ======================================
    // GUARDAR ID DE LA PETICIÓN
    // ======================================

    id_peticion = data.id_peticion;

    console.log(
        "ID de petición:",
        id_peticion
    );


    // ======================================
    // MOSTRAR FORMULARIO DE FEEDBACK
    // ======================================

    feedbackForm.hidden = false;
    // analysisModalContent.style.width = "1250px";
    /// BAMS descomentar si se quiere video en Horizontal
    document.getElementsByClassName('analysis-modal-content')[0].style.width = "1950px";

    // Detener video
    analysisVideo.pause();
}


// ==========================================
// CERRAR MODAL
// ==========================================

function closeModal() {

    analysisModal.hidden = true;

    document.body.style.overflow = "";

    analysisVideo.pause();

    window.location.replace("http://localhost:5000/");
    // window.location.replace("http://132.248.246.161/");

}


// ==========================================
// MOSTRAR RESULTADO
// ==========================================

function showResult(data) {

    // Ocultar loading
    loading.hidden = true;

    // Mantener oculta la sección del carrusel
    carousel.hidden = true;

    // Mantener oculto el botón
    analyzeButton.hidden = true;

    // Mantener visible la imagen seleccionada
    previewContainer.hidden = false;

    // Mostrar resultado
    summary.textContent =
        data.analysis;

    ollamaTime.textContent =
        data.ollama_time;

    clientTime.textContent =
        int(float(data.client_time));

    // jsonResult.textContent =
    //     JSON.stringify(
    //         data,
    //         null,
    //         2
    //     );

    resultContainer.hidden =
        false;

    gobackContainer.hidden =
        false;

    // Mostrar el botón
    gobackButton.hidden = false;
}

// ==========================================
// ENVIAR A FLASK
// ==========================================

async function index() {
    window.location.href = "http://127.0.0.1:5000";
}


// ==========================================
// ENVIAR A FLASK
// ==========================================

async function analyzeImage() {

    hideError();


    if (!selectedImage) {

        showError(
            "Debes seleccionar una imagen."
        );

        return;
    }


    const prompt =
        promptInput.value.trim();


    if (!prompt) {

        showError(
            "Debes escribir un prompt."
        );

        return;
    }


    // ======================================
    // ABRIR MODAL
    // ======================================

    openAnalysisModal();

    try {

        const response =
            await fetch(
                "/analyze",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        image:
                            selectedImage.getAttribute(
                                "src"
                            ),

                        prompt:
                            prompt

                    })
                }
            );


        const data =
            await response.json();

        console.log("Respondió el servicio");

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Error al analizar la imagen."
            );
        }

        id_peticion = data.id_peticion;

        console.log(
            "ID de petición recibido:",
            id_peticion
        );


        // ==================================
        // LA RESPUESTA YA LLEGÓ
        // ==================================

        analysisData = data;

        analysisFinished = true;


        // ==================================
        // VERIFICAR VIDEO + RESPUESTA
        // ==================================

        checkAnalysisFinished();


    } catch (error) {

        // closeModal();

        showError(
            error.message
        );

    }

}

// ==========================================
// ENVIAR FEEDBACK
// ==========================================

feedbackForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        hideError();

        if (!id_peticion) {

            showError(
                "No existe una petición asociada al resultado."
            );

            return;
        }

        const edad =
            document.querySelector(
                'input[name="edad"]:checked'
            );

        const emocion =
            document.querySelector(
                'input[name="emocion"]:checked'
            );

        const profesion =
            document.querySelector(
                'input[name="profesion"]:checked'
            );

        if (!edad || !emocion || !profesion) {

            showError(
                "Debes responder todas las evaluaciones."
            );

            return;
        }

        feedbackButton.disabled = true;

        feedbackButton.textContent =
            "Enviando...";

        try {
            const formData =
                new FormData();

            formData.append(
                "id_peticion",
                id_peticion
            );

            formData.append(
                "edad",
                edad.value
            );

            formData.append(
                "emocion",
                emocion.value
            );

            formData.append(
                "profesion",
                profesion.value
            );

            console.log(
                "Enviando feedback:",
                {
                    id_peticion: id_peticion,
                    edad: edad.value,
                    emocion: emocion.value,
                    profesion: profesion.value
                }
            );
            
            const response =
                await fetch(
                    "/analyze/feedback",
                    {
                        method: "POST",
                        body: formData
                    }
                );

            const responseText =
                await response.text();


            console.log(
                "Status feedback:",
                response.status
            );


            console.log(
                "Respuesta feedback:",
                responseText
            );

            if (!response.ok) {

                throw new Error(
                    `Error del servidor (${response.status}): ${responseText}`
                );
            }


            const data =
                JSON.parse(
                    responseText
                );

            console.log(
                "Feedback guardado:",
                data
            );

            feedbackButton.textContent =
                "Evaluación enviada";

        } catch (error) {

            console.error(
                "Error enviando feedback:",
                error
            );


            showError(
                error.message
            );


            feedbackButton.disabled =
                false;


            feedbackButton.textContent =
                "Enviar evaluación";

        }
        closeModal()
    }
);


// ==========================================
// BOTÓN ANALIZAR
// ==========================================

analyzeButton.addEventListener(
    "click",
    analyzeImage
);


// ==========================================
// BOTÓN GO BACK
// ==========================================

gobackButton.addEventListener(
    "click",
    index
);

// // ==========================================
// // CERRAR MODAL
// // ==========================================

// closeAnalysisModal.addEventListener(
//     "click",
//     closeModal
// );


analysisModalOverlay.addEventListener(
    "click",
    () => {

        // Solo permitir cerrar si ya terminó

        if (!modalResult.hidden) {

            closeModal();

        }

    }
);


// ==========================================
// INICIALIZAR
// ==========================================

setupImageSelection();
setupPagination();