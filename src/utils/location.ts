export async function getLocationData() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
}