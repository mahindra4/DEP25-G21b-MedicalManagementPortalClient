import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRoutes } from "../utils/apiRoutes";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { PrinterIcon } from "@heroicons/react/24/solid";
import {
  Card,
  Typography,
  Button,
  CardBody,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CardFooter
} from "@material-tailwind/react";
import Layout from "../layouts/PageLayout";
import { SyncLoadingScreen } from "../components/UI/LoadingScreen";
import { toast } from "sonner";

// const PRESCRIPTION_TABLE_HEAD = ["Medicine", "Dosage", "Quantity"];
const OBSERVATION_TABLE_HEAD = ["Medicine", "Dosage", "Frequency", "Daily Qty", "Days", "Total Qty"];

const ObservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [observationData, setObservationData] = useState(null);
  const [error, setError] = useState(null);
  //const { id } = useParams();
  const params = id.split("^");
  const observationId = params[0];
  const checkupId = params[1]; 
  
  const handlePrint = () => {
    if (!observationData) return;
    
    const element = document.getElementById("observationDetail");
    const pdfName = `Observation_${observationData.patientName}_${observationData.date}`;
    const options = {
      margin: 10,
      filename: pdfName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(options).save();
  };

  const fetchObservationDetail = async () => {
    try {
      const response = await axios.get(apiRoutes.observation.detail(observationId), {
        withCredentials: true
      });
      
      if (!response.data || !response.data.data) {
        throw new Error("No observation data received from server");
      }
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching observation:", error);
      let errorMessage = "Failed to fetch observation details";
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response received from server";
      }
      
      throw new Error(errorMessage);
    }
  };

  const formatObservationData = (data) => {
    if (!data) return null;
    
    const dateObj = data.checkup?.date ? new Date(data.checkup.date) : new Date();
    
    console.log('data: ',data)
    const formattedData =  {
      id: data.id,
      patientName: data.patient?.name || "-",
      doctorName: data.doctor?.name  || "-",
      staffName: data.staff?.name || "-",
      date: data.date,
      time: data.time,
      temperature: data.temperature || "-",
      bloodPressure: data.bloodPressure || "-",
      spO2: data.spO2 || "-",
      pulseRate: data.pulseRate || "-",
      diagnosis: data.diagnosis ||  "-",
      symptoms: data.symptoms ||  "-",
      referredDoctor: data.referredDoctor || "-",
      referredHospital: data.referredHospital || "-",
      isUnderObservation: data.isUnderObservation || false,
      checkupMedicines: data.checkupMedicines || [],
      observationMedicines: data.observationMedicines || [],
    };
    console.log('data: ');
    console.log(formattedData);
    return formattedData;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchObservationDetail();
        const formattedData = formatObservationData(data);
        
        if (!formattedData) {
          throw new Error("Failed to format observation data");
        }
        
        setObservationData(formattedData);
      } catch (error) {
        console.error("Error loading observation:", error);
        setError(error.message);
        toast.error(error.message);
        navigate("/observation", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  if (loading) return <SyncLoadingScreen />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!observationData) return <div className="p-4">No observation data found</div>;


  return (
    <Layout>
      <div className="flex flex-col self-center lg:w-2/3 h-max">
        <div className="flex flex-col sm:flex-row justify-between py-2">
          <div>
            <Typography variant="h4" color="blue-gray" className="mb-2">
              Observation Details
            </Typography>
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Date: {observationData.date}
            </Typography>
          </div>
          <div className="flex gap-x-2 h-10">
            <Button 
              size="md" 
              onClick={() => navigate(`/observation/update/${id}`)}
            >
              Edit
            </Button>
            <Button
              size="md"
              className="flex gap-x-1 px-4"
              onClick={handlePrint}
            >
              <PrinterIcon className="h-4" /> Print
            </Button>
            <Button
              size="md"
              onClick={() => navigate("/observation")}
            >
              Close
            </Button>
          </div>
        </div>
        
        <Card id="observationDetail" className="w-full h-fit min-h-lvh">
          <CardBody>
            {/* Header with logo */}
            <div className="flex flex-col sm:flex-row border-b border-black p-2 items-center w-full">
              <img
                src="/src/assets/img/iitroparlogo0.jpg"
                alt="logo"
                className="px-4 w-fit h-24 rounded-none"
              />
              <div className="w-full h-full">
                <Typography color="blue-gray" className="text-xl md:text-3xl text-center sm:text-start font-semibold font-serif">
                  Indian Institute of Technology Ropar
                </Typography>
                <Typography color="blue-gray" className="text-base md:text-xl text-center sm:text-start font-medium">
                  Medical center / Rupnagar - 140001, Punjab, India
                </Typography>
                <Typography className="text-end text-sm md:text-base font-semibold">
                  Observation Slip
                </Typography>
              </div>
            </div>

            {/* <div className="grid grid-cols-1 pt-4 pl-10 justify-center">
              <Typography color="red">
                Patient Detail
              </Typography>
            </div> */}


            {/* <div className="pt-6 pl-10">
              <h2 className="text-xl font-semibold text-black-600 mb-2">
                Patient Details
              </h2>
            </div> */}
            
            {/* Patient and Observation Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 pl-10 justify-items-left">
              {/* Personal Details */}
              <Typography variant="small">Patient Name</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.patientName}
              </Typography>
            

              <Typography variant="small">Doctor Name</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.doctorName}
              </Typography>
              

              <Typography variant="small">staff Name</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.staffName}
              </Typography>
              
              {/* <div className="col-span-2 md:col-span-1">
                <Typography variant="small" className="font-bold text-gray-700">
                  Date & Time
                </Typography>
                <Typography variant="paragraph">
                  {observationData.date} {observationData.time}
                </Typography>
              </div> */}

              <Typography variant="small">Date</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.date}
              </Typography>

              <Typography variant="small">Time</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.time}
              </Typography>
              
              {/* Vital Signs */}
              
              <Typography variant="small">Temperature (°C)</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.temperature || "-"}
              </Typography>

              <Typography variant="small">Blood Presure</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.bloodPressure || "-"}
              </Typography>
              
              <Typography variant="small">SpO2 (%)</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.spO2 || "-"}
              </Typography>
            

              <Typography variant="small">Pulse Rate (bpm)</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.pulseRate || "-"}
              </Typography>
              
              {/* Status */}

              <Typography variant="small">Status</Typography>
              <Typography
                variant="paragraph"
                color={observationData.isUnderObservation ? "green" : "gray"}
                className="font-medium"
              >
                {observationData.isUnderObservation ? "Under Observation" : "Not Under Observation"}
              </Typography>
              
              {/* Medical Information */}
              
              <Typography variant="small">Diagnosis</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.diagnosis || "-"}
              </Typography>
              
              <Typography variant="small">Symptoms</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.symptoms || "-"}
              </Typography>

              <Typography variant="small">Referred Doctor</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.referredDoctor || "-"}
              </Typography>

              <Typography variant="small">Referred Hospital</Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-medium"
              >
                {observationData.referredHospital || "-"}
              </Typography>

            </div>
              
            
          <div className="w-full pt-4">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  {OBSERVATION_TABLE_HEAD.map((head) => (
                    <th
                      key={head}
                      className="border-y border-blue-gray-100 bg-blue-gray-50 p-4"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70 text-center"
                      >
                        {head}
                        {head === "Dosage" && "*"}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {observationData.observationMedicines.map((medicine) => (
                  <tr className="text-center border-b border-blue-gray-50">
                    <td className="">
                      <Typography
                        variant="small"
                        // color="blue-gray"
                        className="font-normal p-4"
                      >
                        {medicine.brandName}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        variant="small"
                        // color="blue-gray"
                        className="font-normal"
                      >
                        {medicine.dosage}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        variant="small"
                        // color="blue-gray"
                        className="font-normal"
                      >
                        {medicine.frequency}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        variant="small"
                        // color="blue-gray"
                        className="font-normal"
                      >
                        {medicine.dailyQuantity}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        variant="small"
                        // color="blue-gray"
                        className="font-normal"
                      >
                        {medicine.days}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        variant="small"
                        // color="blue-gray"
                        className="font-normal"
                      >
                        {medicine.totalQuantity}
                      </Typography>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          </CardBody>
          {/* <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Page 1 of 1
            </Typography>
          </CardFooter> */}
        </Card>
      </div>
    </Layout>
  );
};

export default ObservationDetail;