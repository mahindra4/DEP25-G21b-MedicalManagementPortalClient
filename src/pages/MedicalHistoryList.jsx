import { SortableTable } from "../components/SortableTable";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { apiRoutes } from "../utils/apiRoutes";
import { SyncLoadingScreen } from "../components/UI/LoadingScreen";
import { useAuthContext } from "../hooks/useAuthContext";
import Layout from "../layouts/PageLayout";

// Table headers for Medical History
const MEDICAL_TABLE_HEAD = {
  id: "#",
  doctorName: "Doctor",
  staffName: "ParaMedical Staff",
  date: "Date",
  time: "Time",
  diagnosis: "Diagnosis",
  symptoms: "Symptoms",
  action: "Action",
};

// Table headers for Procedure History
// const PROCEDURE_TABLE_HEAD = {
//   id: "#",
//   procedurerecord: "Procedure",
//   patientname: "Patient Name",
//   intime: "Admission Time",
//   outtime: "Discharge Time",
//   patientconditionbefore: "Patient Condition",
//   referredhospital: "Referred Hospital",
// };

// const PROCEDURE_TABLE_HEAD = {
//     id: "#",
//     patientName: "Patient Name",
//     patientEmail: "Email",
//     inTime: "In Time",
//     outTime: "Out Time",
//     referredHospital: "Referred Hospital",
//     procedureRecord: "Procedure",
//     action: "Action"
// };

const PROCEDURE_TABLE_HEAD = {
  id: "#",
  opd: "OPD",
  patientName: "Patient Name",
  patientEmail: "Email",
  inTime: "In Time",
  outTime: "Out Time",
  referredHospital: "Referred Hospital",
  procedureRecord: "Procedure",
  action: "Action"
};

const getMedicalHistory = async (email) => {
  try {
    const response = await axios.get(`${apiRoutes.checkup}/patient/${email}`, {
      withCredentials: true,
    });
    console.log("medical history response", response.data.data);
    toast.success("Medical History fetched successfully");
    return response.data.data;
  } catch (error) {
    console.error(
      `ERROR (get-medical-history): ${error?.response?.data?.message}`
    );
    toast.error(error?.response?.data?.message || "Failed to fetch Medical History");
    return [];
  }
};

const getProcedureHistory = async (email) => {
  try {
    console.log('1 procedure');
    const response = await axios.get(`${apiRoutes.Procedure}/${email}`, {
      withCredentials: true,
    });
    console.log('2 prod');
    console.log("procedure history response", response.data);
    toast.success("Procedure History fetched successfully");
    return response.data;
  } catch (error) {
    console.error(
      `ERROR (get-procedure-history): ${error?.response?.data?.message}`
    );
    toast.error(error?.response?.data?.message || "Failed to fetch Procedure History");
    return [];
  }
};

export default function MedicalHistory() {
  const navigate = useNavigate();
  const { userEmail } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [procedureHistory, setProcedureHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("medical"); // "medical" or "procedure"

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both histories in parallel
        const [medicalData, procedureData] = await Promise.all([
          getMedicalHistory(userEmail),
          getProcedureHistory(userEmail)
        ]);
        
        setMedicalHistory(medicalData || []);
        setProcedureHistory(procedureData || []);
      } catch (error) {
        console.error("Error fetching patient history:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userEmail]);

  const handleHistoryDelete = async (e, id) => {
    // Implement if needed
  };
  
  const handleHistoryDetail = async (e, id, idx) => {
    console.log("Medical History Detail", id);
    navigate(`/prescription/${id}^${idx}`);
  };
  
  const handleProcedureDetail = async (e, id, idx) => {
    console.log("Procedure Detail", id);
    navigate(`/procedure-details/${id}^${idx}`);
  };

  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          <div className="w-full mb-6">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "medical" 
                  ? "border-b-2 border-blue-500 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("medical")}
              >
                Medical History
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "procedure" 
                  ? "border-b-2 border-blue-500 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("procedure")}
              >
                Procedure History
              </button>
            </div>
          </div>

          {activeTab === "medical" && (
            <SortableTable
              tableHead={MEDICAL_TABLE_HEAD}
              title="Medical History List"
              data={medicalHistory}
              detail="See information about all previous checkups."
              text=""
              addLink=""
              handleDelete={handleHistoryDelete}
              searchKey="staffName"
              handleDetail={handleHistoryDetail}
              detailsFlag={true}
              defaultSortOrder="date"
            />
          )}

          {activeTab === "procedure" && (
            <SortableTable
              tableHead={PROCEDURE_TABLE_HEAD}
              title="Procedure History List"
              data={procedureHistory}
              detail="See information about all previous procedures."
              // handleDelete={handleProcedureDelete}
              searchKey="patientName"
              // handleDetail={handleProcedureDetail}
              detailsFlag={true}
              // handleUpdate={handleProcedureUpdate}
              defaultSortOrder="inTime"
            />
          )}
        </Layout>
      )}
    </>
  );
}