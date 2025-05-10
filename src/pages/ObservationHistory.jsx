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
  date: "Date",
  doctorName: "Doctor",
  diagnosis: "Diagnosis",
  medicineDetails: "Medicines",
  status: "Status",
  action: "Action"
};

export default function ObservationHistory() {
  const navigate = useNavigate();
  const { userEmail, token } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState([]);

  const fetchPatientObservations = async (email) => {
    try {
      const response = await axios.get(
        apiRoutes.observation.history(email), // Use the new route helper
        {
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //     'Content-Type': 'application/json'
        //   },
          withCredentials: true
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Observation history error:', error.response?.data);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPatientObservations(userEmail);
        setObservations(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load observation history');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userEmail, token]);

  const handleViewDetails = (id, checkupId) => {
    navigate(`/observation/view/${id}^${checkupId}`);
  };

  if (loading) return <SyncLoadingScreen />;

  return (
    <Layout>
      <SortableTable
        tableHead={TABLE_HEAD}
        title="Observation History"
        data={observations}
        detail="Your medical observation records"
        handleDetail={(row) => handleViewDetails(row.id, row.checkupId)}
        searchKey="doctorName"
        defaultSortOrder="date"
        emptyMessage="No observation records found"
      />
    </Layout>
  );
}