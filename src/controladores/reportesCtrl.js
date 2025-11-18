import { pool } from '../../db.js';

export const productosMasVendidos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.nombre,
             SUM(dp.cantidad) AS total_vendido
      FROM detalle_pedido dp
      INNER JOIN productos p ON p.id_producto = dp.id_producto
      GROUP BY dp.id_producto
      ORDER BY total_vendido DESC
      LIMIT 5;
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error en productosMasVendidos:", error);
    res.status(500).json({ message: "Error en reporte" });
  }
};

export const obtenerEstadosPedidos = async (req, res) => {
  try {
    const [filas] = await pool.query(`
      SELECT 
        SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) AS pendiente,
        SUM(CASE WHEN estado = 'Pagado' THEN 1 ELSE 0 END) AS pagado,
        SUM(CASE WHEN estado = 'Rechazado' THEN 1 ELSE 0 END) AS rechazado,
        SUM(CASE WHEN estado = 'Enviado' THEN 1 ELSE 0 END) AS enviado,
        SUM(CASE WHEN estado = 'Entregado' THEN 1 ELSE 0 END) AS entregado
      FROM pedidos;
    `);

    res.json(filas[0]);
  } catch (error) {
    console.error("Error en obtenerEstadosPedidos:", error);
    res.status(500).json({ message: "Error obteniendo estados" });
  }
};



export const ventasDelMes = async (req, res) => {
  try {
    // Resumen del mes ACTUAL con GROUP BY obligatorio
    const [resumen] = await pool.query(`
      SELECT 
        MONTH(fecha_pedido) AS mes,
        SUM(total) AS ventas,
        COUNT(*) AS pedidos,
        AVG(total) AS promedio
      FROM pedidos
      WHERE MONTH(fecha_pedido) = MONTH(CURDATE())
        AND YEAR(fecha_pedido) = YEAR(CURDATE())
      GROUP BY MONTH(fecha_pedido);
    `);

    // Si no hay ventas este mes
    if (!resumen.length) {
      return res.json([
        {
          mes: new Date().getMonth() + 1,
          ventas: 0,
          pedidos: 0,
          promedio: 0,
          dia_top: "No disponible"
        }
      ]);
    }

    // Top día
    const [dia] = await pool.query(`
      SELECT 
        DAY(fecha_pedido) AS dia,
        SUM(total) AS total_dia
      FROM pedidos
      WHERE MONTH(fecha_pedido) = MONTH(CURDATE())
        AND YEAR(fecha_pedido) = YEAR(CURDATE())
      GROUP BY DAY(fecha_pedido)
      ORDER BY total_dia DESC
      LIMIT 1;
    `);

    const diaTop =
      dia.length > 0
        ? `Día ${dia[0].dia} ($${Number(dia[0].total_dia).toFixed(2)})`
        : "No disponible";

    res.json([
      {
        mes: resumen[0].mes,
        ventas: Number(resumen[0].ventas).toFixed(2),
        pedidos: resumen[0].pedidos,
        promedio: Number(resumen[0].promedio).toFixed(2),
        dia_top: diaTop
      }
    ]);
  } catch (error) {
    console.error("Error en ventasDelMes:", error);
    res.status(500).json({ message: "Error en reporte del mes" });
  }
};
