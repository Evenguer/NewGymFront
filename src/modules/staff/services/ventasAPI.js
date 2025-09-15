const agregarDetallesVenta = async (detalleData) => {
  try {
    console.log('Enviando detalle a la API:', detalleData);
    const response = await axios.post(
      `${VENTAS_ENDPOINT}/agregar-detalle`,
      detalleData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Respuesta de la API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en agregarDetallesVenta:', error);
    throw error;
  }
};