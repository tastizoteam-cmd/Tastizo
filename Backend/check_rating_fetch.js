async function test() {
  try {
    const res1 = await fetch('http://localhost:5000/api/v1/food/restaurant/restaurants');
    const data1 = await res1.json();
    const bakes = data1.data.restaurants.find(r => r.restaurantName?.toLowerCase().includes('atha bakes') || r.name?.toLowerCase().includes('atha bakes'));
    if (!bakes) {
      console.log('atha bakes not found in list API');
      return;
    }
    console.log('List API:', { id: bakes._id, rating: bakes.rating, totalRatings: bakes.totalRatings });

    const res2 = await fetch('http://localhost:5000/api/v1/food/restaurant/restaurants/' + bakes._id);
    const data2 = await res2.json();
    const detail = data2.data.restaurant || data2.data;
    console.log('Detail API:', { id: detail._id, rating: detail.rating, totalRatings: detail.totalRatings, averageRating: detail.averageRating, reviewCount: detail.reviewCount });
  } catch (e) {
    console.error(e.message);
  }
}
test();
