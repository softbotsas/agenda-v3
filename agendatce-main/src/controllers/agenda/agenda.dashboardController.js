const KPIService = require('../../services/agenda/agenda.kpiService');
const ImportService = require('../../services/agenda/agenda.importService');

// Obtener KPIs del dashboard
const getDashboardKPIs = async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;
    const userId = user_id || req.user._id;
    
    const startDate = start_date ? new Date(start_date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = end_date ? new Date(end_date) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    // Calcular KPIs usando el servicio
    const kpis = await KPIService.calculateUserKPIs(userId, startDate, endDate);
    const recentActivity = await KPIService.getRecentActivity(userId, 10);
    
    res.json({
      success: true,
      data: {
        period: {
          start_date: startDate,
          end_date: endDate
        },
        kpis: kpis,
        recent_activity: recentActivity
      }
    });
    
  } catch (error) {
    console.error('Error getting dashboard KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los KPIs del dashboard'
    });
  }
};

// Obtener resumen de todos los usuarios (para representante)
const getAllUsersSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const startDate = start_date ? new Date(start_date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = end_date ? new Date(end_date) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    // Usar el servicio para obtener resumen de usuarios
    const usersSummary = await KPIService.getAllUsersSummary(startDate, endDate);
    
    res.json({
      success: true,
      data: {
        period: {
          start_date: startDate,
          end_date: endDate
        },
        users_summary: usersSummary
      }
    });
    
  } catch (error) {
    console.error('Error getting all users summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el resumen de usuarios'
    });
  }
};

// Exportar datos a CSV
const exportToCSV = async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;
    const userId = user_id || req.user._id;
    
    const result = await ImportService.exportTasksToCSV(userId, start_date, end_date);
    
    if (result.success) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="agenda_export_${Date.now()}.csv"`);
      res.send(result.data);
    } else {
      res.status(500).json(result);
    }
    
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar datos'
    });
  }
};

// Alias para compatibilidad con el router
const getDashboard = getDashboardKPIs;
const getAllUsersDashboard = getAllUsersSummary;

module.exports = {
  getDashboardKPIs,
  getAllUsersSummary,
  exportToCSV,
  getDashboard,
  getAllUsersDashboard
};
