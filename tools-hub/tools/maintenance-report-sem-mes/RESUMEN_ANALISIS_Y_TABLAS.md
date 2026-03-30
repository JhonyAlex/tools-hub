# Resumen corto de tablas y análisis actuales

1. Carga y normalización de CSV
Se parsea el CSV con separador `;`, se limpian encabezados y se mapean columnas al modelo interno. Las columnas de fecha aceptan variaciones de zona horaria en el encabezado (por ejemplo `+01:00` y `+02:00 DST`).

2. Filtro temporal y depuración de datos
Antes de analizar, se eliminan duplicados y se filtran registros por `Fecha de Fin` dentro del rango seleccionado (semanal, mensual o personalizado).

3. Resumen ejecutivo de métricas base
Se muestran cuatro indicadores principales: OTs únicas, registros de mano de obra filtrados, horas totales y tipo de período aplicado.

4. Análisis por activos
Incluye tabla de los activos con más horas (Top 10), mostrando horas, número de OTs y cantidad de registros. Se complementa con gráfico de barras horizontal de horas por activo.

5. Análisis por tipo de OT
Incluye tabla por tipo de OT con OTs, registros, horas totales y tiempo medio por OT. Se complementa con gráfico de torta de distribución y gráfico de barras por volumen.

6. Análisis por trabajador
Incluye tabla por trabajador con OTs, registros y horas totales. Se complementa con gráfico de barras horizontal para visualizar la carga de trabajo.

7. Análisis IA (opcional)
Al ejecutar IA, se agregan: resumen ejecutivo narrativo, hallazgos clave y recomendaciones prácticas sobre los datos agregados.

8. Histórico de reportes
Se pueden guardar reportes y luego consultar historial con filtros por período. Además, hay gráficos de tendencia (horas y OTs) entre reportes guardados.

9. Exportación y uso operativo
El reporte generado se puede copiar para correo y exportar a PDF para difusión o archivo.