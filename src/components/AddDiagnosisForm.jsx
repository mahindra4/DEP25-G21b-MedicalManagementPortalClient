import React, { useEffect, useState } from "react";
import {
  CardBody,
  Input,
  Card,
  CardHeader,
  Typography,
  Button,
  CardFooter,
} from "@material-tailwind/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "../utils/apiRoutes";
import { SyncLoadingScreen } from "./UI/LoadingScreen";
import Layout from "../layouts/PageLayout";
import { setNavigateTimeout, setToastTimeout } from "../utils/customTimeout";
export default function AddAdminForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: "",
    symptom: "",
  });

  const handleChange = (diagnsosis, symptom) => {
    // console.log(e.target);
    // const { name, value } = e.target;
    // console.log(name, value);
    setFormData((prevData) => ({
      ...prevData,
      [diagnsosis]: symptom,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you can handle the submission of the form
    const sendData = {
      diagnosis: formData.diagnosis,
      symptom: formData.symptom,
    };
    setLoading(true);
    try {
      const res = await axios.post(apiRoutes.diagnosis+"/add", sendData, {
        withCredentials: true
      });
      const data = res?.data;
      setToastTimeout("success", "Diagnosis added successfully", 200);
    //   console.log("admin record saved successfully");
    //   setToastTimeout("success", "Admin added successfully", 200);
    //   setNavigateTimeout(navigate, "/admin", 1000);
    } catch (error) {
      console.error(
        `ERROR (create-diagnosis): ${error?.response?.data?.message}`
      );
      setToastTimeout(
        "error",
        error?.response?.data?.message || "Diagnosis creation failed",
        200
      );
    }
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };
  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
        <Card className="h-max w-full">
          <CardHeader
            floated={false}
            shadow={false}
            className="rounded-none pb-3"
          >
            <div className="mb-2 sm:flex sm:flex-row flex-col items-center justify-between gap-8">
              <div>
                <div className="flex flex-row items-center justify-between gap-8">
                  <Typography variant="h5" color="blue-gray">
                    Diagnosis Form
                  </Typography>
                  {/* <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:hidden">
                    <Button
                      className="flex items-center gap-3"
                      size="md"
                      onClick={() => {
                        navigate("/admin");
                      }}
                    >
                      Admin List
                    </Button>
                  </div> */}
                </div>
                <Typography color="gray" className="mt-1 font-normal">
                  Add Diagnosis.
                </Typography>
              </div>
              <div className="hidden sm:flex shrink-0 flex-col gap-2 sm:flex-row">
                <Button
                  className="flex items-center gap-3"
                  size="md"
                  onClick={() => {
                    navigate("/diagnosis/list");
                  }}
                >
                  Diagnsis List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-6">
              <div className="grid md:grid-cols-2 gap-y-8 gap-x-4 w-full">
                <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                  <div className="flex mr-4 w-full md:w-72 justify-end">
                    <label htmlFor="diagnosis">
                      Diagnosis <span className="text-red-800">*</span>:
                    </label>
                  </div>
                  <Input
                    id="diagnosis"
                    size="md"
                    label="diagnosis"
                    className="w-full"
                    name="diagnosis"
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                  <div className="flex mr-2 w-full md:w-72 justify-end">
                    <label htmlFor="symptom">
                      Symptom <span className="text-red-800">*</span>:
                    </label>
                  </div>
                  <Input
                    id="symptom"
                    size="md"
                    label="symptom"
                    name="symptom"
                    type="text"
                    className="w-full"
                    value={formData.symptom}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                  />
                </div>
              </div>
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
