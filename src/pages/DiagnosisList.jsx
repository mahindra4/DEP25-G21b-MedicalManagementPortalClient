import { SortableTable } from "../components/SortableTable";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { SyncLoadingScreen } from "../components/UI/LoadingScreen";
import { useNavigate } from "react-router-dom"; 


const TABLE_HEAD = {
  id: "#",
  diagnosis: "Diagnosis",
  symptom: "Symptoms",
  action: "Action",
};

const mergeSymptomsByDiagnosis = (data) => {
    const grouped = {};
    data.forEach(({diagnosis, symptom}) => {
        if(!grouped[diagnosis]) {
            grouped[diagnosis] = {
                id: diagnosis, 
                diagnosis,
                symptom, 
            };
        }
        else{
            grouped[diagnosis].symptom += `, ${symptom}`;
        }
    })
    return Object.values(grouped);
}

const getDiagnosisData = async () => {
  try {
    console.log("Fetching Diagnosis List: "+apiRoutes.diagnosis+"/list");
    const response = await axios.get(apiRoutes.diagnosis+"/list", {
      withCredentials: true
    });

    console.log("Raw Data: ", response.data.data);
    const groupedData = mergeSymptomsByDiagnosis(response.data.data);
    toast.success("Diagnosis List fetched successfully");
    // return groupedData;
    return response.data.data;
  } catch (error) {
    console.error(`ERROR (get-admin-list): ${error?.response?.data?.message}`);
    toast.error("Failed to fetch Diagnosis List");
  }
};

import Layout from "../layouts/PageLayout";
import { apiRoutes } from "../utils/apiRoutes";

export default function DiagnosisList() {
    const navigate = useNavigate();
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnosisList = async () => {
      const data = await getDiagnosisData();
      setDiagnosisList(data);
      console.log("Diagnosis List: ", data);
      setLoading(false);
    };
    fetchDiagnosisList();
  }, []);

  const handleDiagnosisDelete = async (e, id) => {
    try {
      const res = await axios.delete(`${apiRoutes.diagnosis}/${id}`, {
        withCredentials: true
      });
      console.log(res);
      if (res) {
        const data = res?.data;
        if (data && data.ok) {
          console.log("backend message : ", data.message);
          toast.success(data?.message);
          setDiagnosisList((prev) => prev.filter((p) => p.id !== id));
        } else {
          console.log(`ERROR (get-diagnosis-list): ${data?.message || "NO DATA"}`);
        }
      }
    } catch (err) {
      console.error(`ERROR (delete-diagnosis-symptom): ${err?.response?.data?.message}`);
      toast.error(err?.response?.data?.message || "Failed to delete diagnosis-symptom");
    }
  };
  const handleDiagnosisUpdate = async (id) => {          
    console.log("Update Diagnosis", id);
    navigate(`/diagnosis/update/${id}`);
  }
  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          {/* <SortableTable
            tableHead={TABLE_HEAD}
            title="Diagnosis List"
            data={data}
            detail="See information about all admins."
            text="Add diagnosis"
            addLink="/diagnosis/add"
            // handleDelete={handleAdminDelete}
            // searchKey="name"
          /> */}
          <SortableTable
            tableHead={TABLE_HEAD}
            title="Diagnosis List"
            data={diagnosisList}
            detail="See information about all Diagnosis."
            text="Add Diagnosis"
            addLink="/diagnosis/add"
            handleDelete={handleDiagnosisDelete}
            searchKey="diagnosis"
            // handleDetail={handlePatientVitalsDetail}
            // detailsFlag={true}
            handleUpdate={handleDiagnosisUpdate}
            // defaultSortOrder="date"
        />
        </Layout>
      )}
    </>
  );
}
