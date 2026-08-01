async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/food/restaurants?limit=100');
    const data = await res.json();
    const bakesList = data.data.restaurants.filter(r => r.restaurantName?.toLowerCase().includes('atha bakes') || r.name?.toLowerCase().includes('atha bakes'));
    console.log('Found', bakesList.length, 'Atha Bakes');
    for (const b of bakesList) {
      console.log({ id: b._id, name: b.restaurantName || b.name, rating: b.rating, distance: b.distance, deliveryTime: b.estimatedDeliveryTime });
    }
  } catch (e) {
    console.error(e.message);
  }
}
test();
