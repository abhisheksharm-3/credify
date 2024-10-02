
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.api.routes import router
from app.core.logging_config import configure_logging
from app.core.firebase_config import initialize_firebase
from app.api.forgery_routes import router as forgery_router
import logging
import os
import tempfile
os.environ['NUMBA_DISABLE_JIT'] = '1'
# os.environ['NUMBA_DISABLE_FUNCTION_CACHING'] = '1'
# os.environ['NUMBA_CACHE_DIR'] = "../temp"
import numba

numba.config.DISABLE_JIT = True

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    configure_logging()
    initialize_firebase()

app.include_router(router)
app.include_router(forgery_router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred. Please try again later."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")