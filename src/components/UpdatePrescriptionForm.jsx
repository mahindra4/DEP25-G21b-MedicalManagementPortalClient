import React, { useState, useEffect } from "react";
import Select from "react-select";
import { TrashIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  CardBody,
  Card,
  Input,
  CardHeader,
  Typography,
  Button,
  CardFooter,
  Tooltip,
  IconButton,
  Textarea,
  Checkbox,
} from "@material-tailwind/react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "../utils/apiRoutes";
import { useAuthContext } from "../hooks/useAuthContext";
import { SyncLoadingScreen } from "./UI/LoadingScreen";
import Layout from "../layouts/PageLayout";

export default function UpdatePrescriptionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { userEmail } = useAuthContext();
  const [formData, setFormData] = useState({
    email: "",
    doctor: "",
    date: "",
    temperature: "",
    bloodPressure: "",
    name: "",
    pulseRate: "",
    spO2: "",
    symptoms: "",
    diagnosis: "",
    referredDoctor: "",
    referredHospital: "",
    isUnderObservation: false,
  });

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  
  const TABLE_HEAD = [
    "Medicine Name",
    "Dosage",
    "Quantity",
    "Avl. Qty",
    "Action",
  ];
  
  const OBSERVATION_TABLE_HEAD = [
    "Medicine",
    "Dosage",
    "Frequency",
    "Daily Qty",
    "Avl. Qty",
    "Days",
    "Action",
  ];

  const [dataArray, setDataArray] = useState([
    { name: "", dosage: "", quantity: "" },
  ]);

  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [observationDetails, setObservationDetails] = useState([]);
  const [currentObservationItem, setCurrentObservationItem] = useState({
    medicineId: "",
    name: "",
    dosage: "",
    frequency: "",
    dailyQuantity: "",
    days: 1,
    availableQty: 0
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUpdatedAvailableStock();
      await fetchDoctors();
      await fetchPatients();
      await fetchPrescriptionData();
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchPrescriptionData = async () => {
    try {
      const response = await axios.get(`${apiRoutes.checkup}/${id}`, {
        withCredentials: true,
      });
      console.log('prescription data');
      console.log(response.data.data);
      const prescriptionData = response.data.data;
      
      setFormData({
        email: prescriptionData.patientEmail,
        doctor: prescriptionData.doctorEmail,
        date: prescriptionData.date,
        temperature: prescriptionData.temperature,
        bloodPressure: prescriptionData.bloodPressure,
        pulseRate: prescriptionData.pulseRate,
        spO2: prescriptionData.spO2,
        symptoms: prescriptionData.symptoms,
        diagnosis: prescriptionData.diagnosis,
        referredDoctor: prescriptionData.referredDoctor,
        referredHospital: prescriptionData.referredHospital,
        isUnderObservation: prescriptionData.isUnderObservation || false,
      });

      setSelectedDoctor({
        value: prescriptionData.doctorId,
        label: prescriptionData.doctorEmail,
      });

      setSelectedPatient({
        value: prescriptionData.patientId,
        label: prescriptionData.patientEmail,
        name: prescriptionData.patientName,
      });
      
      console.log(prescriptionData.checkupMedicines);

      // Set checkup medicines
      const checkupMedicines = prescriptionData.checkupMedicines.map(
        (medicine) => {
          return {
            name: {
              value: medicine.id,
              label: medicine.brandName,
              netQuantity: medicines.find((m) => m.medicineId === medicine.id)?.netQuantity,
            },
            dosage: medicine.dosage,
            quantity: medicine.quantity,
          };
        }
      );

      console.log("checkup medicines: ");
      console.log(checkupMedicines);

      setDataArray(checkupMedicines);

      // Set observation details if exists
      if (prescriptionData.observationDetails) {
        setObservationDetails(prescriptionData.observationDetails.map(obs => ({
          medicineId: obs.medicineId,
          name: obs.medicine?.brandName || '',
          dosage: obs.dosage || '',
          frequency: obs.frequency || '',
          dailyQuantity: obs.dailyQuantity || 0,
          days: obs.days || 1,
          availableQty: obs.availableQuantity || 0
        })));
      }
    } catch (error) {
      console.error(`ERROR (fetch-prescription-in-update-prescription): ${error?.response?.data?.message}`);
      toast.error(error?.response?.data?.message || "Failed to fetch Prescription Data");
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(apiRoutes.staff, {
        withCredentials: true,
      });
      response.data.data = response.data.data.filter(
        (staff) => staff.role === "DOCTOR"
      );
      const doctorList = response.data.data;
      setDoctors(doctorList);
    } catch (error) {
      console.error(`ERROR (fetch-doctors-in-add-prescription): ${error?.response?.data?.message}`);
      toast.error(error?.response?.data?.message || "Failed to fetch Doctors List");
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(apiRoutes.patient, {
        withCredentials: true,
      });
      setPatients(response.data.data);
    } catch (error) {
      console.error(`ERROR (fetch-patients-in-add-prescription): ${error?.response?.data?.message}`);
      toast.error(error?.response?.data?.message || "Failed to fetch Patients List");
    }
  };

  const fetchUpdatedAvailableStock = async () => {
    try {
      const response = await axios.get(`${apiRoutes.stock}/available/${id}`, {
        withCredentials: true,
      });
      console.log(response.data.data);
      setMedicines(response.data.data);
    } catch (error) {
      console.error(`ERROR (fetch-medicines-in-add-purchase): ${error?.response?.data?.message}`);
      toast.error(error?.response?.data?.message || "Failed to fetch Medicines");
    }
  };

  const handleInputChange = (key, index, value) => {
    const updatedArray = [...dataArray];
    updatedArray[index][key] = value;
    setDataArray(updatedArray);
  };

  const handleDoctorChange = (selectedDoctor) => {
    setSelectedDoctor(selectedDoctor);
    setFormData((prevData) => ({
      ...prevData,
      doctor: selectedDoctor.value,
    }));
  };

  const handlePatientChange = (selectedPatient) => {
    setSelectedPatient(selectedPatient);
    setFormData((prevData) => ({
      ...prevData,
      email: selectedPatient.label,
    }));
  };

  const handleMedicineChange = (selectedMedicine, index) => {
    setSelectedMedicine(selectedMedicine);
    setDataArray((prevData) => {
      const updatedArray = [...prevData];
      updatedArray[index].name = selectedMedicine;
      return updatedArray;
    });
  };

  const handleChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Observation handlers
  const handleObservationChange = (e) => {
    const { checked } = e.target;
    setFormData(prev => ({
      ...prev,
      isUnderObservation: checked,
    }));
  };

  const handleObservationMedicineChange = (selectedOption) => {
    const selectedMed = medicines.find(m => m.medicineId === selectedOption.value);
    setCurrentObservationItem({
      ...currentObservationItem,
      medicineId: selectedOption.value,
      name: selectedOption.label,
      availableQty: selectedMed?.netQuantity || 0,
    });
  };

  const addObservationDetail = () => {
    if (!currentObservationItem.medicineId) {
      toast.error("Please select a medicine");
      return;
    }
    
    if (!currentObservationItem.dailyQuantity || currentObservationItem.dailyQuantity < 1) {
      toast.error("Please enter a valid daily quantity");
      return;
    }
    
    if (!currentObservationItem.days || currentObservationItem.days < 1) {
      toast.error("Please enter valid number of days");
      return;
    }
    
    const selectedMed = medicines.find(m => m.medicineId === currentObservationItem.medicineId);
    setObservationDetails([...observationDetails, {
      medicineId: currentObservationItem.medicineId,
      name: selectedMed?.medicineName || "",
      dosage: currentObservationItem.dosage || "",
      frequency: currentObservationItem.frequency || "",
      dailyQuantity: currentObservationItem.dailyQuantity,
      days: currentObservationItem.days,
      availableQty: selectedMed?.netQuantity || 0
    }]);

    setCurrentObservationItem({
      medicineId: "",
      name: "",
      dosage: "",
      frequency: "",
      dailyQuantity: "",
      days: 1,
      availableQty: 0
    });
  };

  const updateObservationDetail = (index, field, value) => {
    const updatedDetails = [...observationDetails];
    updatedDetails[index][field] = value;
    setObservationDetails(updatedDetails);
  };

  const removeObservationDetail = (index) => {
    const updatedDetails = observationDetails.filter((_, i) => i !== index);
    setObservationDetails(updatedDetails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.isUnderObservation && observationDetails.length === 0) {
      toast.error("Please add at least 1 medicine for observation patients");
      return;
    }

    const checkupListEntry = {
      patientId: selectedPatient?.value,
      date: formData.date,
      diagnosis: formData.diagnosis,
      isUnderObservation: formData.isUnderObservation,
    };

    if (selectedDoctor?.value) {
      checkupListEntry.doctorId = selectedDoctor?.value;
    }
    if (formData.temperature) {
      checkupListEntry.temperature = formData.temperature;
    }
    if (formData.pulseRate) {
      checkupListEntry.pulseRate = formData.pulseRate;
    }
    if (formData.spO2) {
      checkupListEntry.spO2 = formData.spO2;
    }
    if (formData.bloodPressure) {
      checkupListEntry.bloodPressure = formData.bloodPressure;
    }
    if (formData.symptoms) {
      checkupListEntry.symptoms = formData.symptoms;
    }
    if (formData.referredDoctor) {
      checkupListEntry.referredDoctor = formData.referredDoctor;
    }
    if (formData.referredHospital) {
      checkupListEntry.referredHospital = formData.referredHospital;
    }

    const checkupMedicines = dataArray.map((data) => {
      const medicines = {
        medicineId: data?.name?.value,
        quantity: parseInt(data.quantity) || 0,
      };
      if (data.dosage) medicines.dosage = data.dosage;
      return medicines;
    });

    // Prepare observation data if needed
    let observationData = null;
    if (formData.isUnderObservation) {
      observationData = observationDetails.map(detail => ({
        medicineId: detail.medicineId,
        dosage: detail.dosage || '',
        frequency: detail.frequency || '',
        dailyQuantity: parseInt(detail.dailyQuantity) || 1,
        days: parseInt(detail.days) || 1,
        availableQty: parseInt(detail.availableQty) || 0
      }));
    }

    const data = {
      ...checkupListEntry,
      staffEmail: userEmail,
      checkupMedicines,
      observationDetails: observationData,
    };

    console.log(data);
    setLoading(true);
    try {
      const response = await axios.put(`${apiRoutes.checkup}/${id}`, data, {
        withCredentials: true,
      });
      console.log(response.data);
      toast.success(response.data.message);
      setTimeout(() => {
        navigate("/prescription");
      }, 1000);
    } catch (error) {
      console.error(`ERROR (update-prescription): ${error?.response?.data?.message}`);
      toast.error(error?.response?.data?.message || "Failed to update Prescription");
    }
    setLoading(false);
  };

  const handleAddRow = () => {
    setDataArray((prevData) => [
      ...prevData,
      { name: "", dosage: "", quantity: "" },
    ]);
  };

  const handleDeleteRow = (index) => {
    if (formData.referredDoctor === "" && formData.referredHospital === "" && dataArray.length === 1) {
      toast.error("At least one Medicine is required in the prescription");
      return;  
    }
    setDataArray((prev) => {
      const newData = [...prev];
      newData.splice(index, 1);
      return newData;
    });
  };

  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          <Card className="h-max w-full">
            <CardHeader floated={false} shadow={false} className="rounded-none pb-3">
              <div className="mb-2 sm:flex sm:flex-row flex-col items-center justify-between gap-8">
                <div>
                  <Typography variant="h5" color="blue-gray">
                    Edit Prescription Details
                  </Typography>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex items-center gap-3"
                    size="md"
                    onClick={() => navigate("/prescription")}
                  >
                    Prescription List
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="flex flex-wrap gap-6">
                <div className="grid md:grid-cols-2 gap-y-8 gap-x-4 w-full">
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-4 w-full md:w-72 justify-end">
                      <label htmlFor="email">
                        Patient Email <span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Select
                      id="email"
                      options={patients.map((patient) => ({
                        value: patient.id,
                        label: patient.email,
                        name: patient.name,
                      }))}
                      name="email"
                      placeholder="Select Patient"
                      className="w-full"
                      value={selectedPatient}
                      onChange={handlePatientChange}
                      isClearable={true}
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="name">
                        Patient Name <span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Input
                      id="name"
                      size="md"
                      name="name"
                      label=""
                      className="w-full"
                      value={selectedPatient?.name || ""}
                      disabled
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="temperature">Temp.(C)</label>:
                    </div>
                    <Input
                      id="temperature"
                      size="md"
                      name="temperature"
                      label="Temperature"
                      className="w-full"
                      value={formData.temperature}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="pulseRate">PR(beats/min)</label>:
                    </div>
                    <Input
                      id="pulseRate"
                      type="number"
                      min={1}
                      size="md"
                      name="pulseRate"
                      label="Pulse Rate"
                      className="w-full"
                      value={formData.pulseRate}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="spO2">SpO2 (%)</label>:
                    </div>
                    <Input
                      id="spO2"
                      size="md"
                      name="spO2"
                      label="SpO2"
                      className="w-full"
                      value={formData.spO2}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="bloodPressure">BP(mm Hg)</label>:
                    </div>
                    <Input
                      id="bloodPressure"
                      size="md"
                      name="bloodPressure"
                      label="Blood pressure"
                      className="w-full"
                      value={formData.bloodPressure}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="date">
                        Date<span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Input
                      id="date"
                      size="md"
                      label="Date"
                      name="date"
                      type="date"
                      className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                      value={formData.date}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="doctor">Doctor:</label>
                    </div>
                    <Select
                      id="doctor"
                      options={doctors.map((doctor) => ({
                        value: doctor.id,
                        label: doctor.email,
                      }))}
                      name="doctor"
                      placeholder="Select Doctor"
                      className="w-full"
                      value={selectedDoctor}
                      onChange={handleDoctorChange}
                      isClearable={true}
                    />
                  </div>

                  {/* Observation Checkbox */}
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="isUnderObservation">Patient Under Observation:</label>
                    </div>
                    <Checkbox
                      id="isUnderObservation"
                      name="isUnderObservation"
                      checked={formData.isUnderObservation}
                      onChange={handleObservationChange}
                      className="h-5 w-5"
                    />
                  </div>

                  <div className="flex-col md:flex md:flex-row items-start justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="diagnosis">
                        Diagnosis<span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Textarea
                      id="diagnosis"
                      size="md"
                      label="Diagnosis"
                      name="diagnosis"
                      type="text"
                      className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                      value={formData.diagnosis}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>

                  <div className="flex-col md:flex md:flex-row items-start justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="symptoms">Symptoms:</label>
                    </div>
                    <Textarea
                      id="symptoms"
                      size="md"
                      label="Symptoms"
                      name="symptoms"
                      type="text"
                      className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                      value={formData.symptoms}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-start justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="referredDoctor">Referred Doctor:</label>
                    </div>
                    <Textarea
                      id="referredDoctor"
                      size="md"
                      label="Referred Doctor"
                      name="referredDoctor"
                      type="text"
                      className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                      value={formData.referredDoctor}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-start justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="referredHospital">Referred Hospital:</label>
                    </div>
                    <Textarea
                      id="referredHospital"
                      size="md"
                      label="Referred Hospital"
                      name="referredHospital"
                      type="text"
                      className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                      value={formData.referredHospital}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Medicine Prescription Table */}
                <div className="w-full">
                  <table className="w-full min-w-max table-auto text-left">
                    <thead>
                      <tr>
                        {TABLE_HEAD.map((head) => (
                          <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                              {head}
                              {head !== "Action" && <span className="text-red-800">*</span>}
                            </Typography>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataArray.map((data, index) => (
                        <tr key={index} className="even:bg-blue-gray">
                          <td className="p-4">
                            <Select
                              id="medicine"
                              options={medicines.map((stock) => ({
                                value: stock.medicineId,
                                netQuantity: stock.netQuantity,
                                label: stock.medicineName,
                              }))}
                              value={data["name"]}
                              onChange={(selectedMedicine) => handleMedicineChange(selectedMedicine, index)}
                              isClearable={true}
                              placeholder="Select Medicine"
                              className="w-full"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                              placeholder="Dosage"
                              value={data["dosage"]}
                              onChange={(e) => handleInputChange("dosage", index, e.target.value)}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                              <input
                                type="number"
                                min={1}
                                className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                                placeholder="Quantity"
                                value={data["quantity"]}
                                onChange={(e) => handleInputChange("quantity", index, e.target.value)}
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex-col md:flex md:flex-row items-center justify-start p-1 min-w-[200px]">
                              <Input
                                type="number"
                                min={1}
                                value={data['name']?.netQuantity || ""}
                                disabled
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <Tooltip content="Delete">
                              <IconButton
                                variant="text"
                                onClick={() => handleDeleteRow(index)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="4" className="p-4">
                          <div className="flex justify-center items-center gap-2">
                            <Tooltip content="Add">
                              <IconButton variant="text" onClick={handleAddRow}>
                                <PlusCircleIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Observation Treatment Plan Section */}
                {formData.isUnderObservation && (
                  <div className="w-full mt-6">
                    <Typography variant="h6" color="blue-gray" className="mb-4">
                      Observation Treatment Plan
                    </Typography>
                    
                    <table className="w-full min-w-max table-auto text-left">
                      <thead>
                        <tr>
                          {OBSERVATION_TABLE_HEAD.map((head) => (
                            <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                {head}
                              </Typography>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Existing Observation Items */}
                        {observationDetails.map((detail, index) => (
                          <tr key={index} className="even:bg-blue-gray-50/50">
                            <td className="p-4">{detail.name}</td>
                            <td className="p-4">
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded p-2"
                                value={detail.dosage}
                                onChange={(e) => updateObservationDetail(index, 'dosage', e.target.value)}
                                placeholder="Optional"
                              />
                            </td>
                            <td className="p-4">
                              <select
                                className="w-full border border-gray-300 rounded p-2"
                                value={detail.frequency}
                                onChange={(e) => updateObservationDetail(index, 'frequency', e.target.value)}
                              >
                                <option value="">Select Frequency</option>
                                <option value="OD">Once Daily (OD)</option>
                                <option value="BD">Twice Daily (BD)</option>
                                <option value="TDS">Thrice Daily (TDS)</option>
                                <option value="QID">Four Times Daily (QID)</option>
                                <option value="HS">At Bedtime (HS)</option>
                                <option value="SOS">As Needed (SOS)</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <input
                                type="number"
                                min="1"
                                className="w-full border border-gray-300 rounded p-2"
                                value={detail.dailyQuantity}
                                onChange={(e) => updateObservationDetail(index, 'dailyQuantity', e.target.value)}
                              />
                            </td>
                            <td className="p-4">{detail.availableQty}</td>
                            <td className="p-4">
                              <input
                                type="number"
                                min="1"
                                className="w-full border border-gray-300 rounded p-2"
                                value={detail.days}
                                onChange={(e) => updateObservationDetail(index, 'days', e.target.value)}
                              />
                            </td>
                            <td className="p-4">
                              <Tooltip content="Delete">
                                <IconButton
                                  variant="text"
                                  color="red"
                                  onClick={() => removeObservationDetail(index)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                            </td>
                          </tr>
                        ))}

                        {/* Add New Observation Item */}
                        <tr className="even:bg-blue-gray-50/50">
                          <td className="p-4">
                            <Select
                              options={medicines.map(m => ({
                                value: m.medicineId,
                                label: m.medicineName,
                                quantity: m.netQuantity
                              }))}
                              value={currentObservationItem.medicineId ? 
                                { value: currentObservationItem.medicineId, label: currentObservationItem.name } : null}
                              onChange={handleObservationMedicineChange}
                              placeholder="Select Medicine"
                              className="w-full"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded p-2"
                              placeholder="Optional"
                              value={currentObservationItem.dosage}
                              onChange={(e) => setCurrentObservationItem({
                                ...currentObservationItem,
                                dosage: e.target.value
                              })}
                            />
                          </td>
                          <td className="p-4">
                            <select
                              className="w-full border border-gray-300 rounded p-2"
                              value={currentObservationItem.frequency}
                              onChange={(e) => setCurrentObservationItem({
                                ...currentObservationItem,
                                frequency: e.target.value
                              })}
                            >
                              <option value="">Select Frequency</option>
                              <option value="OD">Once Daily (OD)</option>
                              <option value="BD">Twice Daily (BD)</option>
                              <option value="TDS">Thrice Daily (TDS)</option>
                              <option value="QID">Four Times Daily (QID)</option>
                              <option value="HS">At Bedtime (HS)</option>
                              <option value="SOS">As Needed (SOS)</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              min="1"
                              className="w-full border border-gray-300 rounded p-2"
                              value={currentObservationItem.dailyQuantity}
                              onChange={(e) => setCurrentObservationItem({
                                ...currentObservationItem,
                                dailyQuantity: e.target.value
                              })}
                              required
                            />
                          </td>
                          <td className="p-4">
                            {currentObservationItem.availableQty || "-"}
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              min="1"
                              className="w-full border border-gray-300 rounded p-2"
                              value={currentObservationItem.days}
                              onChange={(e) => setCurrentObservationItem({
                                ...currentObservationItem,
                                days: e.target.value
                              })}
                              required
                            />
                          </td>
                          <td className="p-4">
                            <IconButton 
                              variant="text" 
                              onClick={addObservationDetail}
                              disabled={!currentObservationItem.medicineId || !currentObservationItem.dailyQuantity}
                            >
                              <PlusCircleIcon className="h-5 w-5" />
                            </IconButton>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </form>
            </CardBody>
            <CardFooter divider={true}>
              <div className="flex justify-end">
                <Button
                  className="flex items-center gap-3"
                  size="lg"
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </div>
            </CardFooter>
          </Card>
        </Layout>
      )}
    </>
  );
}