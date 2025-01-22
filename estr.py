import os

def guardar_estructura_con_iconos(archivo_salida):
    ruta_actual = os.getcwd()  # Obtiene la carpeta actual
    # Agrega el archivo de salida a la lista de archivos excluidos
    archivos_excluidos = [
        "pca_model.pkl",
        "pruebamaira.ipynb",
        "Texto_extraido.txt",
        "package-lock.json",
        "estructura_carpeta_con_iconos.txt",
        ".readme",
        "estrucutra.py",
        archivo_salida  # Excluir el archivo de salida para evitar recursión
    ]
    carpetas_excluidas = ["__pycache__", ".git", "venv", "node_modules","DATOS",""]  # Carpetas a excluir
    # Iconos para carpetas y archivos
    ICONO_CARPETA = "📁"
    ICONO_ARCHIVO = "📄"

    with open(archivo_salida, 'w', encoding='utf-8') as archivo:
        for ruta, directorios, archivos in os.walk(ruta_actual):
            # Excluir carpetas especificadas
            directorios[:] = [d for d in directorios if d not in carpetas_excluidas]

            # Calcular el nivel de profundidad para la indentación
            nivel = ruta.replace(ruta_actual, "").count(os.sep)
            indentacion = "    " * nivel
            nombre_carpeta = os.path.basename(ruta) or ruta_actual
            # Escribir la carpeta actual con el icono
            archivo.write(f"{indentacion}{ICONO_CARPETA} {nombre_carpeta}/\n")

            # Escribir los archivos en la carpeta actual con su icono y contenido
            for nombre_archivo in archivos:
                # Excluir el archivo de salida y otros archivos especificados
                if nombre_archivo in archivos_excluidos:
                    archivo.write(f"{indentacion}    {ICONO_ARCHIVO} {nombre_archivo}\n")
                    archivo.write(f"{indentacion}        [Contenido no mostrado para este archivo]\n")
                    continue

                archivo_ruta = os.path.join(ruta, nombre_archivo)
                archivo.write(f"{indentacion}    {ICONO_ARCHIVO} {nombre_archivo}\n")

                # Excluir contenido de archivos específicos
                if nombre_archivo not in archivos_excluidos:
                    try:
                        with open(archivo_ruta, 'r', encoding='utf-8') as archivo_codigo:
                            contenido = archivo_codigo.read()
                            contenido_indentado = "\n".join([
                                f"{indentacion}        {linea}" for linea in contenido.splitlines()
                            ])
                            archivo.write(f"{contenido_indentado}\n")
                    except Exception as e:
                        archivo.write(f"{indentacion}        [No se pudo leer el archivo: {e}]\n")
                else:
                    archivo.write(f"{indentacion}        [Contenido no mostrado para este archivo]\n")
    print(f"Estructura y contenido guardados en '{archivo_salida}'.")

# Ejecutar el script
archivo_salida = "estructura_carpeta_con_iconos.txt"  # Nombre del archivo de salida
guardar_estructura_con_iconos(archivo_salida)
