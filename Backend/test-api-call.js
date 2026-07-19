import fetch from 'node-fetch';

async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/food/hero-banners/under-250');
    const json = await res.json();
    console.log('GET /food/hero-banners/under-250 response:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
