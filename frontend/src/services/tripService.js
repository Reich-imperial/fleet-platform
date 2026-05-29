export const getTrips = async (params) => {
  console.log('tripService.getTrips placeholder', params);
  return [];
};

export const getTrip = async (id) => {
  console.log('tripService.getTrip placeholder', id);
  return null;
};

export const createTrip = async (data) => {
  console.log('tripService.createTrip placeholder', data);
  return data;
};

export const dispatchTrip = async (id) => {
  console.log('tripService.dispatchTrip placeholder', id);
  return { success: true };
};

export const completeTrip = async (id) => {
  console.log('tripService.completeTrip placeholder', id);
  return { success: true };
};

export const cancelTrip = async (id, reason) => {
  console.log('tripService.cancelTrip placeholder', id, reason);
  return { success: true };
};
