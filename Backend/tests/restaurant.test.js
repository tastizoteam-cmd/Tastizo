import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { FoodRestaurant } from '../src/modules/food/restaurant/models/restaurant.model.js';
import { FoodZone } from '../src/modules/food/admin/models/zone.model.js';

describe('Restaurant API Filters', () => {
  let mockZone;

  beforeAll(async () => {
    // Create a mock zone
    mockZone = await FoodZone.create({
      name: 'Test Zone Filter',
      zoneName: 'Test Zone Filter',
      country: 'India',
      isActive: true,
      coordinates: [
        { latitude: 22.7, longitude: 75.8 },
        { latitude: 22.7, longitude: 75.9 },
        { latitude: 22.8, longitude: 75.9 },
        { latitude: 22.8, longitude: 75.8 }
      ]
    });

    // Seed mock restaurants for testing various filters
    await FoodRestaurant.create([
      {
        restaurantName: 'TestFilter Cafe 1',
        ownerName: 'Owner 1',
        ownerPhone: '9000000001',
        status: 'approved',
        isAdminApproved: true,
        isAcceptingOrders: true,
        zoneId: mockZone._id,
        location: {
          type: 'Point',
          coordinates: [75.85, 22.75]
        },
        city: 'Indore',
        area: 'Bhawarkua',
        cuisines: ['North Indian', 'Chinese'],
        rating: 4.6,
        totalRatings: 120,
        featuredPrice: 200,
        estimatedDeliveryTimeMinutes: 25,
        estimatedDeliveryTime: '25 mins',
        offer: '20% OFF'
      },
      {
        restaurantName: 'TestFilter Pizza 2',
        ownerName: 'Owner 2',
        ownerPhone: '9000000002',
        status: 'approved',
        isAdminApproved: true,
        isAcceptingOrders: true,
        zoneId: mockZone._id,
        location: {
          type: 'Point',
          coordinates: [75.85, 22.75]
        },
        city: 'Indore',
        area: 'Vijay Nagar',
        cuisines: ['Italian'],
        rating: 4.2,
        totalRatings: 50,
        featuredPrice: 400,
        estimatedDeliveryTimeMinutes: 35,
        estimatedDeliveryTime: '35 mins'
      },
      {
        restaurantName: 'TestFilter Veg 3',
        ownerName: 'Owner 3',
        ownerPhone: '9000000003',
        status: 'approved',
        isAdminApproved: true,
        isAcceptingOrders: true,
        zoneId: mockZone._id,
        location: {
          type: 'Point',
          coordinates: [75.85, 22.75]
        },
        city: 'Bhopal',
        area: 'MP Nagar',
        cuisines: ['South Indian'],
        rating: 3.8,
        totalRatings: 10,
        featuredPrice: 150,
        estimatedDeliveryTimeMinutes: 45,
        estimatedDeliveryTime: '45 mins'
      }
    ]);
  });

  afterAll(async () => {
    // Clean up our seeded mock data
    await FoodRestaurant.deleteMany({ restaurantName: { $regex: '^TestFilter' } });
    await FoodZone.deleteOne({ _id: mockZone._id });
  });

  describe('GET /api/v1/food/restaurant/restaurants', () => {
    it('should search and fetch all TestFilter mock restaurants', async () => {
      const res = await request(app)
        .get('/api/v1/food/restaurant/restaurants')
        .query({ search: 'TestFilter' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.restaurants.length).toBe(3);
    });

    it('should filter restaurants by city', async () => {
      const res = await request(app)
        .get('/api/v1/food/restaurant/restaurants')
        .query({ search: 'TestFilter', city: 'Indore' });

      expect(res.status).toBe(200);
      expect(res.body.data.restaurants.length).toBe(2);
      const names = res.body.data.restaurants.map(r => r.restaurantName);
      expect(names).toContain('TestFilter Cafe 1');
      expect(names).toContain('TestFilter Pizza 2');
    });

    it('should filter restaurants by area', async () => {
      const res = await request(app)
        .get('/api/v1/food/restaurant/restaurants')
        .query({ search: 'TestFilter', area: 'Bhawarkua' });

      expect(res.status).toBe(200);
      expect(res.body.data.restaurants.length).toBe(1);
      expect(res.body.data.restaurants[0].restaurantName).toBe('TestFilter Cafe 1');
    });

    it('should filter restaurants by cuisine', async () => {
      const res = await request(app)
        .get('/api/v1/food/restaurant/restaurants')
        .query({ search: 'TestFilter', cuisine: 'Italian' });

      expect(res.status).toBe(200);
      expect(res.body.data.restaurants.length).toBe(1);
      expect(res.body.data.restaurants[0].restaurantName).toBe('TestFilter Pizza 2');
    });

    it('should filter restaurants that have active offers', async () => {
      const res = await request(app)
        .get('/api/v1/food/restaurant/restaurants')
        .query({ search: 'TestFilter', hasOffers: 'true' });

      expect(res.status).toBe(200);
      expect(res.body.data.restaurants.length).toBe(1);
      expect(res.body.data.restaurants[0].restaurantName).toBe('TestFilter Cafe 1');
    });

    it('should filter restaurants by minimum rating', async () => {
      const res = await request(app)
        .get('/api/v1/food/restaurant/restaurants')
        .query({ search: 'TestFilter', minRating: 4.0 });

      expect(res.status).toBe(200);
      expect(res.body.data.restaurants.length).toBe(2);
      const names = res.body.data.restaurants.map(r => r.restaurantName);
      expect(names).toContain('TestFilter Cafe 1');
      expect(names).toContain('TestFilter Pizza 2');
    });

    it('should filter restaurants by maximum delivery time', async () => {
      const res = await request(app)
        .get('/api/v1/food/restaurant/restaurants')
        .query({ search: 'TestFilter', maxDeliveryTime: 30 });

      expect(res.status).toBe(200);
      expect(res.body.data.restaurants.length).toBe(1);
      expect(res.body.data.restaurants[0].restaurantName).toBe('TestFilter Cafe 1');
    });

    it('should filter restaurants by maximum price', async () => {
      const res = await request(app)
        .get('/api/v1/food/restaurant/restaurants')
        .query({ search: 'TestFilter', maxPrice: 250 });

      expect(res.status).toBe(200);
      expect(res.body.data.restaurants.length).toBe(2);
      const names = res.body.data.restaurants.map(r => r.restaurantName);
      expect(names).toContain('TestFilter Cafe 1');
      expect(names).toContain('TestFilter Veg 3');
    });

    it('should filter top-rated restaurants (rating >= 4.5)', async () => {
      const res = await request(app)
        .get('/api/v1/food/restaurant/restaurants')
        .query({ search: 'TestFilter', topRated: 'true' });

      expect(res.status).toBe(200);
      expect(res.body.data.restaurants.length).toBe(1);
      expect(res.body.data.restaurants[0].restaurantName).toBe('TestFilter Cafe 1');
    });

    it('should filter trusted restaurants (totalRatings >= 100)', async () => {
      const res = await request(app)
        .get('/api/v1/food/restaurant/restaurants')
        .query({ search: 'TestFilter', trusted: 'true' });

      expect(res.status).toBe(200);
      expect(res.body.data.restaurants.length).toBe(1);
      expect(res.body.data.restaurants[0].restaurantName).toBe('TestFilter Cafe 1');
    });
  });
});
