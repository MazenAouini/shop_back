import Product from '../Models/ProductsModel.js';
import Order from '../Models/CommandeModel.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const revenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      totalProducts,
      totalOrders,
      revenue: revenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching admin stats',
      error: error.message 
    });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    // Fetch recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('createdAt totalAmount user');

    // Fetch recent products
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('createdAt name');

    // Combine and sort activities
    const activities = [
      ...recentOrders.map(order => ({
        timestamp: order.createdAt,
        description: `New order received for $${order.totalAmount}`
      })),
      ...recentProducts.map(product => ({
        timestamp: product.createdAt,
        description: `New product added: ${product.name}`
      }))
    ].sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching recent activity',
      error: error.message 
    });
  }
}; 