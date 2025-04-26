// const baseUrl = import.meta.env.VITE_API_URL;

const baseUrl = "http://172.30.8.218/api" 

export const apiRoutes = {
  baseUrl,
  purchase: `${baseUrl}/purchase`,
  checkup: `${baseUrl}/checkup`,
  supplier: `${baseUrl}/supplier`,
  medicine: `${baseUrl}/medicine`,
  stock: `${baseUrl}/stock`,
  patient: `${baseUrl}/patient`,
  category: `${baseUrl}/category`,
  admin: `${baseUrl}/admin`,
  otp: `${baseUrl}/otp`,
  mail: `${baseUrl}/mail`,
  requests: `${baseUrl}/requests`,
  auth: `${baseUrl}/auth`,
  staff: `${baseUrl}/staff`,
  schedule: `${baseUrl}/schedule`,
  dashboard: `${baseUrl}/dashboard`,
  profile: `${baseUrl}/profile`,
  diagnosis: `${baseUrl}/diagnosis`,
  hospitals: `${baseUrl}/hospitals`,
  patientVitals: `${baseUrl}/patient_vitals`,
  Procedure: `${baseUrl}/procedure`,
  observation: {
    base: `${baseUrl}/observation`,
    list: `${baseUrl}/observation`,
    detail: (id) => `${baseUrl}/observation/${id}`,
    update: (id) => `${baseUrl}/observation/${id}`,
    delete: (id) => `${baseUrl}/observation/${id}`
  },
};

// console.log(apiRoutes)
