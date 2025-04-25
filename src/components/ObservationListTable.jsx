import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'sonner';
import { apiRoutes } from "../utils/apiRoutes";
import { SyncLoadingScreen } from "./UI/LoadingScreen";
import { SortableTable } from "./SortableTable";
import Layout from "../layouts/PageLayout";

const TABLE_HEAD = {
  id: "#",
  patientName: "Patient Name",
  doctorName: "Doctor",
  spO2: "SpO2 (%)",
  temperature: "Temp (°C)",
  bloodPressure: "BP (mmHg)",
  pulseRate: "PR (bpm)",
  date: "Date",
  diagnosis: "Diagnosis",
  symptoms: "Symptoms",
  medicineDetails: "Medicines (Dosage/Freq)",
  totalQuantity: "Total Qty",
  status: "Status",
  action: "Action"
};

const fetchObservations = async () => {
  try {
    const response = await axios.get(apiRoutes.observation.list, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch observations:', error);
    throw error;
  }
};

export default function ObservationListTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchObservations();
        setObservations(data);
        toast.success('Observation list loaded successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load observations');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this observation?');
    if (!confirmDelete) return;
  
    try {
      setDeletingId(id);
      const response = await axios.delete(`${apiRoutes.observation}/${id}`, {
        withCredentials: true
      });
      
      if (response.data.ok) {
        toast.success('Observation deleted successfully');
        setObservations(prev => prev.filter(obs => obs.id !== id));
      } else {
        toast.error(response.data.message || 'Failed to delete observation');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 
                 error.response?.data?.message || 
                 'Failed to delete observation');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (rowData) => {
    try {
      if (!rowData?.id) {
        throw new Error('Observation data is missing ID');
      }
      // Use the checkupId as the second parameter
      navigate(`/observation/view/${rowData.id}^${rowData.checkupId}`);
    } catch (error) {
      console.error('Error in handleViewDetails:', error);
      toast.error('Failed to view observation details');
    }
  };

  const handleEdit = (rowData) => {
    try {
      console.log("Full row data received:", rowData); // Should now show full object
      
      // Get checkupId from either root or nested checkup object
      const checkupId = rowData.checkupId || rowData?.checkup?.id;
      
      if (!checkupId) {
        console.error("No checkupId found in:", rowData);
        throw new Error('Observation data is missing checkup ID');
      }
      
      console.log("Navigating to update with checkupId:", checkupId);
      navigate(`/prescription/update/${checkupId}`);
    } catch (error) {
      console.error('Edit error:', error);
      toast.error(`Failed to edit observation: ${error.message}`);
    }
  };
  if (loading) return <SyncLoadingScreen />;

  return (
    <Layout>
      <SortableTable
        tableHead={TABLE_HEAD}
        title="Patients Under Observation"
        data={observations}
        detail="View and manage all patients under medical observation"
        text="Add New Observation"
        addLink="/prescription/add"
        handleDelete={handleDelete}
        searchKey="patientName"
        handleDetail={handleViewDetails}
        detailsFlag={true}
        handleUpdate={handleEdit}
        defaultSortOrder="date"
        isDeleting={(id) => deletingId === id}
      />
    </Layout>
  );
}