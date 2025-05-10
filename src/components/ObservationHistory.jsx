import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { apiRoutes } from "../utils/apiRoutes";
import { SyncLoadingScreen } from "../components/UI/LoadingScreen";
import { useAuthContext } from "../hooks/useAuthContext";
import Layout from "../layouts/PageLayout";
import { SortableTable } from "../components/SortableTable";

const TABLE_HEAD = {
  id: "#",
  doctorName: "Doctor",
  staffName: "ParaMedical Staff",
  date: "Date",
  temperature: "Temp (°C)",
  bloodPressure: "BP (mmHg)",
  pulseRate: "PR (bpm)",
  spO2: "SpO2 (%)",
  diagnosis: "Diagnosis",
  symptoms: "Symptoms",
  medicineDetails: "Medicines (Dosage/Freq)",
  totalQuantity: "Total Qty",
  status: "Status",
  action: "Action"
};

const fetchPatientObservations = async (email) => {
  try {
    const response = await axios.get(`${apiRoutes.observation.patient}/${email}`, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch patient observations:', error);
    throw error;
  }
};

export default function PatientObservationHistory() {
  const navigate = useNavigate();
  const { userEmail } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPatientObservations(userEmail);
        setObservations(data);
        toast.success('Observation history loaded successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load observation history');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userEmail]);

  const handleViewDetails = (rowData) => {
    try {
      if (!rowData?.id) {
        throw new Error('Observation data is missing ID');
      }
      navigate(`/observation/view/${rowData.id}^${rowData.checkupId}`);
    } catch (error) {
      console.error('Error in handleViewDetails:', error);
      toast.error('Failed to view observation details');
    }
  };

  if (loading) return <SyncLoadingScreen />;

  return (
    <Layout>
      <SortableTable
        tableHead={TABLE_HEAD}
        title="Your Observation History"
        data={observations}
        detail="View your past and current medical observations"
        text=""
        addLink=""
        handleDelete={null} // Patients typically can't delete observations
        searchKey="doctorName"
        handleDetail={handleViewDetails}
        detailsFlag={true}
        defaultSortOrder="date"
      />
    </Layout>
  );
}