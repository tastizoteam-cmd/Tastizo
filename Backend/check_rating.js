const axios = require('axios');

async function test() {
  try {
    const res1 = await axios.get('http://localhost:8080/api/v1/food/restaurants?limit=100');
    const bakes = res1.data.data.restaurants.find(r => r.restaurantName?.toLowerCase().includes('atha bakes') || r.name?.toLowerCase().includes('atha bakes'));
    console.log('List API:', { id: bakes._id, rating: bakes.rating, totalRatings: bakes.totalRatings });

    const res2 = await axios.get('http://localhost:8080/api/v1/food/restaurants/' + bakes._id);
    const detail = res2.data.data.restaurant || res2.data.data;
    console.log('Detail API:', { id: detail._id, rating: detail.rating, totalRatings: detail.totalRatings, averageRating: detail.averageRating, reviewCount: detail.reviewCount });
  } catch (e) {
    console.error(e.message);
  }
}
test();
