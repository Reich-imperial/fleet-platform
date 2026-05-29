export const getVehicles = async (params) => {
  console.log('vehicleService.getVehicles placeholder', params);
  return [];
};

export const getVehicle = async (id) => {
  console.log('vehicleService.getVehicle placeholder', id);
  return null;
};

export const createVehicle = async (data) => {
  console.log('vehicleService.createVehicle placeholder', data);
  return data;
};

export const updateVehicle = async (id, data) => {
  console.log('vehicleService.updateVehicle placeholder', id, data);
  return data;
};

export const deleteVehicle = async (id) => {
  console.log('vehicleService.deleteVehicle placeholder', id);
  return { success: true };
};
