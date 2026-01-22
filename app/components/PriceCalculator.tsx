import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";


const STEPS = [
    "Plan Selection",
    "Project Details",
    "Panel Configuration",
    "Inverter Setup",
    "Structure & Wiring",
    "Additional Components",
    "Review & Submit",
];

const BASE_URL = "https://sunvoracrm.berisphere.com";

export default function PriceCalculator() {
    const [plans, setPlans] = useState<string[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [reviewPreference, setReviewPreference] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [projectDetails, setProjectDetails] = useState({
        projectSize: "",
        manufacturer: "",
    });
    const [projectSizes, setProjectSizes] = useState<string[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [manufacturers, setManufacturers] = useState<string[]>([]);
    const [loadingManufacturers, setLoadingManufacturers] = useState(false);
    const [panelTypes, setPanelTypes] = useState<string[]>([]);
    const [loadingPanelTypes, setLoadingPanelTypes] = useState(false);
    const [panelCapacities, setPanelCapacities] = useState<string[]>([]);
    const [loadingPanelCapacities, setLoadingPanelCapacities] = useState(false);
    const [inverterBrands, setInverterBrands] = useState<string[]>([]);
    const [loadingInverterBrands, setLoadingInverterBrands] = useState(false);
    const [inverterCapacities, setInverterCapacities] = useState<string[]>([]);
    const [loadingInverterCapacities, setLoadingInverterCapacities] = useState(false);
    const [structureTypes, setStructureTypes] = useState<string[]>([]);
    const [loadingStructureTypes, setLoadingStructureTypes] = useState(false);
    const [structureOptions, setstructureOptions] = useState<string[]>([]);
    const [loadingstructure, setLoadingstructure] = useState(false);
    const [wireManufacturers, setWireManufacturers] = useState<string[]>([]);
    const [wireThicknessOptions, setWireThicknessOptions] = useState<string[]>([]);
    const [wireLengthOptions, setWireLengthOptions] = useState<string[]>([]);

    const [loadingWireManufacturer, setLoadingWireManufacturer] = useState(false);
    const [loadingWireThickness, setLoadingWireThickness] = useState(false);
    const [loadingWireLength, setLoadingWireLength] = useState(false);
    const [acDcBoxOptions, setAcDcBoxOptions] = useState<string[]>([]);
    const [loadingAcDcBox, setLoadingAcDcBox] = useState(false);
    const [earthingOptions, setEarthingOptions] = useState<string[]>([]);
    const [loadingEarthing, setLoadingEarthing] = useState(false);
    const [chemicalAnchoringOptions, setChemicalAnchoringOptions] = useState<string[]>([]);
    const [loadingChemicalAnchoring, setLoadingChemicalAnchoring] = useState(false);
    const [preferenceId, setPreferenceId] = useState<number | null>(null);

    const [panelConfig, setPanelConfig] = useState({
        capacity: "",
        type: "",
    });
    const [inverterSetup, setInverterSetup] = useState({
        brand: "",
        capacity: "",
    });
    const [structureWiring, setStructureWiring] = useState({
        structureType: "",
        structure: "",
        wireManufacturer: "",
        wireThickness: "",
        wireLength: "",
    });

    const [additionalComponents, setAdditionalComponents] = useState({
        acDcBox: "",
        earthing: "",
        chemicalAnchoring: "",
    });


    const { prospectId, mode } = useLocalSearchParams<{
        prospectId: string;
        mode?: string;
    }>();

    const router = useRouter();

    const isPreferenceMode = mode === "preference";

    const [openDropdown, setOpenDropdown] = useState<
        | "projectSize"
        | "manufacturer"
        | "panelCapacity"
        | "panelType"
        | "inverterBrand"
        | "inverterCapacity"
        | "structureType"
        | "structure"
        | "wireManufacturer"
        | "wireThickness"
        | "wireLength"
        | "acDcBox"
        | "earthing"
        | "chemicalAnchoring"
        | null
    >(null);

    const fetchPlans = async () => {
        try {
            console.log("📦 Fetching plans...");
            setLoadingPlans(true);

            const token = await AsyncStorage.getItem("token");

            const res = await axios.get(`${BASE_URL}/pricing/plan`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            console.log("📦 Plan API response:", res.data);

            if (res.data?.status === "success" && Array.isArray(res.data.data)) {
                setPlans(res.data.data);
            } else {
                setPlans([]);
                Alert.alert("Error", "Invalid plan data");
            }
        } catch (error: any) {
            console.log("❌ Fetch Plans Error:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to load plans");
        } finally {
            setLoadingPlans(false);
        }
    };

    useEffect(() => {
        if (currentStep === 1 && plans.length === 0) {
            fetchPlans();
        }
    }, [currentStep]);

    useEffect(() => {
        if (currentStep === 2 && projectSizes.length === 0) {
            fetchProjectSizes();
        }
    }, [currentStep]);

    useEffect(() => {
        if (currentStep === 3 && manufacturers.length === 0) {
            fetchManufacturers();
        }
    }, [currentStep]);

    useEffect(() => {
        if (currentStep === 3 && projectDetails.manufacturer) {
            // reset panel type when manufacturer changes
            setPanelConfig((prev) => ({
                ...prev,
                type: "",
            }));

            setPanelTypes([]);
            fetchPanelTypes(projectDetails.manufacturer);
        }
    }, [currentStep, projectDetails.manufacturer]);

    useEffect(() => {
        if (
            currentStep === 3 &&
            projectDetails.manufacturer &&
            panelConfig.type
        ) {
            // reset capacity when dependencies change
            setPanelConfig((prev) => ({
                ...prev,
                capacity: "",
            }));

            setPanelCapacities([]);
            fetchPanelCapacities(
                projectDetails.manufacturer,
                panelConfig.type
            );
        }
    }, [currentStep, projectDetails.manufacturer, panelConfig.type]);

    useEffect(() => {
        if (currentStep === 4 && inverterBrands.length === 0) {
            fetchInverterBrands();
        }
    }, [currentStep]);

    useEffect(() => {
        if (currentStep === 4 && inverterSetup.brand) {
            // reset capacity when brand changes
            setInverterSetup((prev) => ({
                ...prev,
                capacity: "",
            }));

            setInverterCapacities([]);
            fetchInverterCapacities(inverterSetup.brand);
        }
    }, [currentStep, inverterSetup.brand]);

    useEffect(() => {
        if (currentStep === 5) {
            fetchStructureTypes();
            fetchWireManufacturers();
        }
    }, [currentStep]);

    useEffect(() => {
        if (!structureWiring.structureType) return;

        setStructureWiring(prev => ({
            ...prev,
            structure: "",
        }));

        setstructureOptions([]);
        fetchstructure(structureWiring.structureType);
    }, [structureWiring.structureType]);


    useEffect(() => {
        if (!structureWiring.wireManufacturer) return;

        setStructureWiring(prev => ({
            ...prev,
            wireThickness: "",
            wireLength: "",
        }));

        setWireThicknessOptions([]);
        setWireLengthOptions([]);

        fetchWireThickness(structureWiring.wireManufacturer);
    }, [structureWiring.wireManufacturer]);



    useEffect(() => {
        if (
            !structureWiring.wireManufacturer ||
            !structureWiring.wireThickness
        )
            return;

        setStructureWiring(prev => ({
            ...prev,
            wireLength: "",
        }));

        setWireLengthOptions([]);
        fetchWireLength(
            structureWiring.wireManufacturer,
            structureWiring.wireThickness
        );
    }, [structureWiring.wireManufacturer, structureWiring.wireThickness]);

    useEffect(() => {
        if (currentStep === 6 && acDcBoxOptions.length === 0) {
            fetchAcDcBoxOptions();
        }
    }, [currentStep]);

    useEffect(() => {
        if (currentStep === 6) {
            if (acDcBoxOptions.length === 0) fetchAcDcBoxOptions();
            if (earthingOptions.length === 0) fetchEarthingOptions();
        }
    }, [currentStep]);

    useEffect(() => {
        if (currentStep === 6 && chemicalAnchoringOptions.length === 0) {
            fetchChemicalAnchoring();
        }
    }, [currentStep]);



    const fetchProjectSizes = async () => {
        try {
            setLoadingProjects(true);

            const token = await AsyncStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/pricing/project`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = await res.json();
            console.log("✅ Project Sizes:", data);

            if (data.status === "success") {
                // Optional: remove empty / junk strings
                const cleanData = data.data.filter(
                    (item: string) => item && item.trim().includes("KW")
                );
                setProjectSizes(cleanData);
            } else {
                throw new Error("Failed to load project sizes");
            }
        } catch (err: any) {
            console.log("❌ Project Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load project sizes");
        } finally {
            setLoadingProjects(false);
        }
    };

    const fetchManufacturers = async () => {
        try {
            console.log("🏭 Fetching panel manufacturers");
            setLoadingManufacturers(true);

            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
                `${BASE_URL}/pricing/pannel/manufacturer`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();
            console.log("🏭 Manufacturer API response:", data);

            if (data.status === "success") {
                setManufacturers(
                    data.data.filter(
                        (item: string) => item && item.trim().length > 0
                    )
                );
            } else {
                throw new Error("Failed to load manufacturers");
            }
        } catch (err: any) {
            console.log("❌ Manufacturer Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load manufacturers");
        } finally {
            setLoadingManufacturers(false);
        }
    };

    const fetchPanelTypes = async (manufacturer: string) => {
        try {
            console.log("🔌 Fetching panel types for:", manufacturer);
            setLoadingPanelTypes(true);

            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
                `${BASE_URL}/pricing/pannel/pannel_type?manufacturer=${encodeURIComponent(
                    manufacturer
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();
            console.log("🔌 Panel Type API response:", data);

            if (data.status === "success") {
                setPanelTypes(
                    data.data.filter(
                        (item: string) => item && item.trim().length > 0
                    )
                );
            } else {
                throw new Error("Failed to load panel types");
            }
        } catch (err: any) {
            console.log("❌ Panel Type Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load panel types");
        } finally {
            setLoadingPanelTypes(false);
        }
    };

    const fetchPanelCapacities = async (
        manufacturer: string,
        panelType: string
    ) => {
        try {
            console.log("⚡ Fetching panel capacities:", manufacturer, panelType);
            setLoadingPanelCapacities(true);

            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
                `${BASE_URL}/pricing/pannel/pannel_capacity?manufacturer=${encodeURIComponent(
                    manufacturer
                )}&pannel_type=${encodeURIComponent(panelType)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();
            console.log("⚡ Panel Capacity API response:", data);

            if (data.status === "success") {
                setPanelCapacities(
                    data.data.filter(
                        (item: string) => item && item.trim().length > 0
                    )
                );
            } else {
                throw new Error("Failed to load panel capacities");
            }
        } catch (err: any) {
            console.log("❌ Panel Capacity Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load panel capacities");
        } finally {
            setLoadingPanelCapacities(false);
        }
    };

    const fetchInverterBrands = async () => {
        try {
            console.log("🔌 Fetching inverter brands");
            setLoadingInverterBrands(true);

            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
                `${BASE_URL}/pricing/inverter/brand`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();
            console.log("🔌 Inverter Brand API response:", data);

            if (data.status === "success") {
                setInverterBrands(
                    data.data.filter(
                        (item: string) => item && item.trim().length > 0
                    )
                );
            } else {
                throw new Error("Failed to load inverter brands");
            }
        } catch (err: any) {
            console.log("❌ Inverter Brand Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load inverter brands");
        } finally {
            setLoadingInverterBrands(false);
        }
    };

    const fetchStructureTypes = async () => {
        try {
            console.log("🏗️ Fetching structure types");
            setLoadingStructureTypes(true);

            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
                `${BASE_URL}/pricing/structure/type`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();
            console.log("🏗️ Structure Type API response:", data);

            if (data.status === "success") {
                setStructureTypes(
                    data.data.filter(
                        (item: string) => item && item.trim().length > 0
                    )
                );
            } else {
                throw new Error("Failed to load structure types");
            }
        } catch (err: any) {
            console.log("❌ Structure Type Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load structure types");
        } finally {
            setLoadingStructureTypes(false);
        }
    };

    const fetchInverterCapacities = async (brand: string) => {
        try {
            console.log("⚡ Fetching inverter capacities for:", brand);
            setLoadingInverterCapacities(true);

            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
                `${BASE_URL}/pricing/inverter/capacity?brand=${encodeURIComponent(
                    brand
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();
            console.log("⚡ Inverter Capacity API response:", data);

            if (data.status === "success") {
                setInverterCapacities(
                    data.data.filter(
                        (item: string) => item && item.trim().length > 0
                    )
                );
            } else {
                throw new Error("Failed to load inverter capacities");
            }
        } catch (err: any) {
            console.log("❌ Inverter Capacity Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load inverter capacities");
        } finally {
            setLoadingInverterCapacities(false);
        }
    };

    const fetchstructure = async (structureType: string) => {
        try {
            console.log("🔧 Fetching structure for:", structureType);
            setLoadingstructure(true);

            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
                `${BASE_URL}/pricing/structure?structure_type=${encodeURIComponent(
                    structureType
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();
            console.log("🔧 structure API response:", data);

            if (data.status === "success") {
                setstructureOptions(
                    data.data.filter(
                        (item: string) => item && item.trim().length > 0
                    )
                );
            } else {
                throw new Error("Failed to load structure");
            }
        } catch (err: any) {
            console.log("❌ structure Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load structure");
        } finally {
            setLoadingstructure(false);
        }
    };

    const fetchWireManufacturers = async () => {
        try {
            setLoadingWireManufacturer(true);
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/pricing/wiring/manufacturer`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = await res.json();
            if (data.status === "success") {
                setWireManufacturers(data.data);
            }
        } catch (e) {
            Alert.alert("Error", "Failed to load wire manufacturers");
        } finally {
            setLoadingWireManufacturer(false);
        }
    };

    const fetchWireThickness = async (manufacturer: string) => {
        try {
            console.log("🧵 Fetching wire thickness for:", manufacturer);
            setLoadingWireThickness(true);

            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
                `${BASE_URL}/pricing/wiring/thickness?manufacturer=${encodeURIComponent(manufacturer)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();
            console.log("🧵 Wire Thickness API response:", data);

            if (data.status === "success") {
                setWireThicknessOptions(
                    data.data.filter((i: string) => i && i.trim().length > 0)
                );
            }
        } catch (e) {
            Alert.alert("Error", "Failed to load wire thickness");
        } finally {
            setLoadingWireThickness(false);
        }
    };


    const fetchWireLength = async (
        manufacturer: string,
        thickness: string
    ) => {
        try {
            console.log("🧵 Fetching wire length:", manufacturer, thickness);
            setLoadingWireLength(true);

            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
                `${BASE_URL}/pricing/wiring/length?manufacturer=${encodeURIComponent(
                    manufacturer
                )}&thickness=${encodeURIComponent(thickness)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();
            console.log("🧵 Wire Length API response:", data);

            if (data.status === "success") {
                setWireLengthOptions(
                    data.data.filter(
                        (item: string) => item && item.trim().length > 0
                    )
                );
            } else {
                throw new Error("Failed to load wire length");
            }
        } catch (err: any) {
            console.log("❌ Wire Length Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load wire length");
        } finally {
            setLoadingWireLength(false);
        }
    };

    const fetchAcDcBoxOptions = async () => {
        try {
            setLoadingAcDcBox(true);
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/pricing/ac_dc_box`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = await res.json();
            console.log("🔌 AC/DC Box API response:", data);

            if (data.status === "success") {
                setAcDcBoxOptions(
                    data.data.filter(
                        (item: string) => item && item.trim().length > 0
                    )
                );
            } else {
                throw new Error("Failed to load AC/DC box options");
            }
        } catch (err: any) {
            console.log("❌ AC/DC Box Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load AC/DC box options");
        } finally {
            setLoadingAcDcBox(false);
        }
    };

    const fetchEarthingOptions = async () => {
        try {
            setLoadingEarthing(true);
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/pricing/earthing`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = await res.json();
            console.log("⚡ Earthing API response:", data);

            if (data.status === "success") {
                setEarthingOptions(
                    data.data.filter(
                        (item: string) => item && item.trim().length > 0
                    )
                );
            } else {
                throw new Error("Failed to load earthing options");
            }
        } catch (err: any) {
            console.log("❌ Earthing Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load earthing options");
        } finally {
            setLoadingEarthing(false);
        }
    };

    const fetchChemicalAnchoring = async () => {
        try {
            setLoadingChemicalAnchoring(true);
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/pricing/chemical_anchoring`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = await res.json();
            console.log("🧪 Chemical Anchoring API:", data);

            if (data.status === "success") {
                setChemicalAnchoringOptions(
                    data.data.filter(
                        (item: string) => item && item.trim().length > 0
                    )
                );
            } else {
                throw new Error("Failed to load chemical anchoring");
            }
        } catch (e: any) {
            console.log("❌ Chemical Anchoring Error:", e.message);
            Alert.alert("Error", "Failed to load chemical anchoring");
        } finally {
            setLoadingChemicalAnchoring(false);
        }
    };






    const nextStep = () => {
        if (currentStep === 1 && !selectedPlan) {
            Alert.alert("Required", "Please select a plan");
            return;
        }
        if (currentStep === 2) {
            if (!projectDetails.projectSize) {
                alert("Please select project size");
                return;
            }
        }

        if (currentStep === 3) {
            if (
                !projectDetails.manufacturer ||
                !panelConfig.type ||
                !panelConfig.capacity
            ) {
                alert("Please complete panel configuration");
                return;
            }
        }


        if (currentStep === 4) {
            if (!inverterSetup.brand || !inverterSetup.capacity) {
                alert("Please complete inverter setup");
                return;
            }
        }
        if (currentStep === 5) {
            if (
                !structureWiring.structureType ||
                !structureWiring.structure ||
                !structureWiring.wireManufacturer ||
                !structureWiring.wireThickness ||
                !structureWiring.wireLength
            ) {
                alert("Please complete structure & wiring details");
                return;
            }
        }

        if (currentStep === 6) {
            const { acDcBox, earthing, chemicalAnchoring } = additionalComponents;

            if (!acDcBox || !earthing || !chemicalAnchoring) {
                Alert.alert("Required", "Please select all additional components");
                return;
            }
        }


        setCompletedSteps((prev) =>
            prev.includes(currentStep) ? prev : [...prev, currentStep]
        );

        if (currentStep < STEPS.length) {
            setCurrentStep((prev) => prev + 1);
        }


    };



    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };


    const fetchPreferenceForReview = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
                `${BASE_URL}/pricing/client_preference?prospect_id=${prospectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();
            console.log("📄 Review Preference:", data);

            if (data.status === "success") {
                setReviewPreference(data.data);
            } else {
                throw new Error("Failed to fetch preference");
            }
        } catch (err: any) {
            console.log("❌ Review Fetch Error:", err.message);
            Alert.alert("Error", "Failed to load review data");
        }
    };


    const submitPreference = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const payload = {
                prospect_id: Number(prospectId),
                plan: selectedPlan,
                project_size: projectDetails.projectSize,
                pannel_manufacturer: projectDetails.manufacturer,
                pannel_capacity: panelConfig.capacity,
                pannel_type: panelConfig.type,
                inverter_brand: inverterSetup.brand,
                inverter_capacity: inverterSetup.capacity,
                structure_type: structureWiring.structureType,
                structure: structureWiring.structureType,
                wire_length: structureWiring.structure,
                wire_manufacturer: "Default", // or API-driven later
                wire_thickness: structureWiring.structure,
                ac_dc_box: additionalComponents.acDcBox,
                earthing: additionalComponents.earthing,
                chemical_anchoring: additionalComponents.chemicalAnchoring,
            };

            console.log("🚀 Preference Payload:", payload);

            const res = await fetch(
                "https://sunvoracrm.berisphere.com/pricing/client_preference/add",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();
            console.log("✅ Preference Saved:", data);

            Alert.alert("Success", "Preference saved successfully");

            // 🔁 Go back to quotation preview
            router.replace({
                pathname: "/components/QuotationPreviewScreen",
                params: { leadId: prospectId },
            });
        } catch (err: any) {
            console.log("❌ Preference Error:", err.message);
            Alert.alert("Error", "Failed to save preference");
        }
    };

    const saveAndGoToReview = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const payload = {
                prospect_id: Number(prospectId),
                plan: selectedPlan,
                project_size: projectDetails.projectSize,

                pannel_manufacturer: projectDetails.manufacturer,
                pannel_type: panelConfig.type,
                pannel_capacity: panelConfig.capacity,

                inverter_brand: inverterSetup.brand,
                inverter_capacity: inverterSetup.capacity,

                structure_type: structureWiring.structureType,
                structure: structureWiring.structure,

                wire_manufacturer: structureWiring.wireManufacturer,
                wire_thickness: structureWiring.wireThickness,
                wire_length: structureWiring.wireLength,

                ac_dc_box: additionalComponents.acDcBox,
                earthing: additionalComponents.earthing,
                chemical_anchoring: additionalComponents.chemicalAnchoring,
            };

            console.log("🚀 Saving Preference:", payload);

            const res = await fetch(
                "https://sunvoracrm.berisphere.com/pricing/client_preference/add",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();
            console.log("✅ Save Response:", data);

            if (data.status !== "success") {
                throw new Error(data.error?.message || "Save failed");
            }

            setCompletedSteps((prev) =>
                prev.includes(6) ? prev : [...prev, 6]
            );

            setCurrentStep(7);
            await fetchPreferenceForReview();
        } catch (err: any) {
            console.log("❌ Save Preference Error:", err.message);
            Alert.alert("Error", err.message);
        }
    };

    const submitQuotation = async () => {
        if (!preferenceId) {
            Alert.alert("Error", "Preference not found. Please save again.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");

            const payload = {
                preference_id: preferenceId,
            };

            console.log("🚀 Submitting Quotation:", payload);

            const res = await fetch(
                `${BASE_URL}/pricing/submit/quotation`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();
            console.log("✅ Submit Response:", data);

            if (data.status !== "success") {
                throw new Error(data.error?.message || "Submit failed");
            }

            Alert.alert("Success", "Quotation submitted successfully");

            router.replace({
                pathname: "/components/QuotationPreviewScreen",
                params: { leadId: prospectId },
            });

        } catch (err: any) {
            console.log("❌ Submit Quotation Error:", err.message);
            Alert.alert("Error", err.message);
        }
    };





    const editPreference = () => {
        setCurrentStep(1);
    };

    const downloadQuotation = () => { };
    const goToPreview = () => { };
    return (
        <View style={styles.container}>
            {/* Header */}
            <Text style={styles.title}>Price Calculator</Text>
            <Text style={styles.subtitle}>
                Configure your solar panel system pricing
            </Text>

            {/* Step Indicator */}
            <View style={styles.stepper}>
                {STEPS.map((label, index) => {
                    const step = index + 1;
                    const isActive = step === currentStep;
                    const isCompleted = completedSteps.includes(step);

                    return (
                        <View key={step} style={styles.stepItem}>
                            <View
                                style={[
                                    styles.stepCircle,
                                    isActive && styles.activeStep,
                                    isCompleted && styles.completedStep,
                                ]}
                            >
                                <Text style={styles.stepText}>
                                    {isCompleted ? "✔" : step}
                                </Text>
                            </View>

                            <Text
                                style={[
                                    styles.stepLabel,
                                    isActive && styles.activeLabel,
                                ]}
                            >
                                {label}
                            </Text>
                        </View>
                    );
                })}
            </View>
            {/* Content */}
            <ScrollView style={styles.card}>
                <Text style={styles.stepTitle}>{STEPS[currentStep - 1]}</Text>

                {/* STEP 1: PLAN SELECTION */}
                {/* STEP 1: PLAN SELECTION */}
                {currentStep === 1 && (
                    <>
                        <Text style={styles.stepTitle}>Plan Selection</Text>
                        <Text style={styles.subtitleSmall}>
                            Select a pricing plan
                        </Text>

                        {loadingPlans ? (
                            <Text>Loading plans...</Text>
                        ) : (
                            plans.map((plan) => (
                                <TouchableOpacity
                                    key={plan}
                                    style={[
                                        styles.planBox,
                                        selectedPlan === plan && styles.selectedPlan,
                                    ]}
                                    onPress={() => setSelectedPlan(plan)}
                                >
                                    <Text
                                        style={[
                                            styles.planText,
                                            selectedPlan === plan && styles.selectedPlanText,
                                        ]}
                                    >
                                        {plan}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </>
                )}

                {/* STEP 2: PROJECT DETAILS */}
                {currentStep === 2 && (
                    <>
                        <Text style={styles.subtitleSmall}>
                            Select project size
                        </Text>

                        <Text style={styles.label}>Project Size *</Text>

                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setOpenDropdown(
                                    openDropdown === "projectSize" ? null : "projectSize"
                                )
                            }
                        >
                            <Text>
                                {projectDetails.projectSize ||
                                    (loadingProjects ? "Loading..." : "Select project size")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "projectSize" &&
                            projectSizes.map((size) => (
                                <TouchableOpacity
                                    key={size}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setProjectDetails({
                                            ...projectDetails,
                                            projectSize: size,
                                        });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{size}</Text>
                                </TouchableOpacity>
                            ))}
                    </>
                )}


                {/* STEP 3: PANEL CONFIGURATION */}
                {currentStep === 3 && (
                    <>
                        <Text style={styles.subtitleSmall}>
                            Configure solar panels
                        </Text>

                        {/* Manufacturer */}
                        {/* Manufacturer */}
                        <Text style={styles.label}>Manufacturer *</Text>

                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setOpenDropdown(
                                    openDropdown === "manufacturer" ? null : "manufacturer"
                                )
                            }
                        >
                            <Text>
                                {projectDetails.manufacturer ||
                                    (loadingManufacturers
                                        ? "Loading manufacturers..."
                                        : "Select manufacturer")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "manufacturer" &&
                            manufacturers.map((brand) => (
                                <TouchableOpacity
                                    key={brand}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setProjectDetails({
                                            ...projectDetails,
                                            manufacturer: brand,
                                        });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{brand}</Text>
                                </TouchableOpacity>
                            ))}

                        {/* Panel Type */}
                        {/* Panel Type */}
                        <Text style={styles.label}>Panel Type *</Text>

                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setOpenDropdown(
                                    openDropdown === "panelType" ? null : "panelType"
                                )
                            }
                            disabled={!projectDetails.manufacturer || loadingPanelTypes}
                        >
                            <Text>
                                {!projectDetails.manufacturer
                                    ? "Select manufacturer first"
                                    : panelConfig.type ||
                                    (loadingPanelTypes
                                        ? "Loading panel types..."
                                        : "Select panel type")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "panelType" &&
                            panelTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setPanelConfig({
                                            ...panelConfig,
                                            type,
                                        });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{type}</Text>
                                </TouchableOpacity>
                            ))}



                        {/* Panel Capacity */}
                        <Text style={styles.label}>Panel Capacity *</Text>

                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setOpenDropdown(
                                    openDropdown === "panelCapacity" ? null : "panelCapacity"
                                )
                            }
                            disabled={
                                !projectDetails.manufacturer ||
                                !panelConfig.type ||
                                loadingPanelCapacities
                            }
                        >
                            <Text>
                                {!projectDetails.manufacturer
                                    ? "Select manufacturer first"
                                    : !panelConfig.type
                                        ? "Select panel type first"
                                        : panelConfig.capacity ||
                                        (loadingPanelCapacities
                                            ? "Loading panel capacities..."
                                            : "Select panel capacity")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "panelCapacity" &&
                            panelCapacities.map((cap) => (
                                <TouchableOpacity
                                    key={cap}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setPanelConfig({
                                            ...panelConfig,
                                            capacity: cap,
                                        });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{cap}</Text>
                                </TouchableOpacity>
                            ))}
                    </>
                )}
                {/* STEP 4: INVERTER SETUP */}
                {currentStep === 4 && (
                    <>
                        {/* <Text style={styles.stepTitle}>Inverter Setup</Text> */}
                        <Text style={styles.subtitleSmall}>
                            Select inverter specifications
                        </Text>

                        {/* Inverter Brand */}
                        {/* Inverter Brand */}
                        <Text style={styles.label}>Inverter Brand *</Text>

                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setOpenDropdown(
                                    openDropdown === "inverterBrand" ? null : "inverterBrand"
                                )
                            }
                        >
                            <Text>
                                {inverterSetup.brand ||
                                    (loadingInverterBrands
                                        ? "Loading inverter brands..."
                                        : "Select inverter brand")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "inverterBrand" &&
                            inverterBrands.map((brand) => (
                                <TouchableOpacity
                                    key={brand}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setInverterSetup({
                                            ...inverterSetup,
                                            brand,
                                        });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{brand}</Text>
                                </TouchableOpacity>
                            ))}


                        {/* Inverter Capacity */}
                        <Text style={styles.label}>Inverter Capacity *</Text>

                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setOpenDropdown(
                                    openDropdown === "inverterCapacity" ? null : "inverterCapacity"
                                )
                            }
                            disabled={!inverterSetup.brand || loadingInverterCapacities}
                        >
                            <Text>
                                {!inverterSetup.brand
                                    ? "Select inverter brand first"
                                    : inverterSetup.capacity ||
                                    (loadingInverterCapacities
                                        ? "Loading inverter capacities..."
                                        : "Select inverter capacity")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "inverterCapacity" &&
                            inverterCapacities.map((cap) => (
                                <TouchableOpacity
                                    key={cap}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setInverterSetup({
                                            ...inverterSetup,
                                            capacity: cap,
                                        });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{cap}</Text>
                                </TouchableOpacity>
                            ))}
                    </>
                )}
                {/* STEP 5: STRUCTURE & WIRING */}
                {currentStep === 5 && (
                    <>
                        {/* <Text style={styles.stepTitle}>Structure & Wiring</Text> */}
                        <Text style={styles.subtitleSmall}>
                            Configure structure and wiring
                        </Text>

                        {/* Structure Type */}
                        {/* Structure Type */}
                        <Text style={styles.label}>Structure Type *</Text>

                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setOpenDropdown(
                                    openDropdown === "structureType" ? null : "structureType"
                                )
                            }
                        >
                            <Text>
                                {structureWiring.structureType ||
                                    (loadingStructureTypes
                                        ? "Loading structure types..."
                                        : "Select structure type")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "structureType" &&
                            structureTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setStructureWiring({
                                            ...structureWiring,
                                            structureType: type,
                                        });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{type}</Text>
                                </TouchableOpacity>
                            ))}


                        {/* structure */}
                        {/* structure */}
                        <Text style={styles.label}>structure *</Text>

                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setOpenDropdown(
                                    openDropdown === "structure" ? null : "structure"
                                )
                            }
                            disabled={!structureWiring.structureType || loadingstructure}
                        >
                            <Text>
                                {!structureWiring.structureType
                                    ? "Select structure type first"
                                    : structureWiring.structure ||
                                    (loadingstructure
                                        ? "Loading structure..."
                                        : "Select structure")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "structure" &&
                            structureOptions.map((wire) => (
                                <TouchableOpacity
                                    key={wire}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setStructureWiring({
                                            ...structureWiring,
                                            structure: wire,
                                        });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{wire}</Text>
                                </TouchableOpacity>
                            ))}

                        {/* Wire Manufacturer */}
                        <Text style={styles.label}>Wire Manufacturer *</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            disabled={loadingWireManufacturer}
                            onPress={() =>
                                setOpenDropdown(openDropdown === "wireManufacturer" ? null : "wireManufacturer")
                            }
                        >

                            <Text>
                                {structureWiring.wireManufacturer ||
                                    (loadingWireManufacturer ? "Loading..." : "Select wire manufacturer")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "wireManufacturer" &&
                            wireManufacturers.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setStructureWiring({ ...structureWiring, wireManufacturer: item });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            ))}

                        {/* Wire Thickness */}
                        {/* Wire Thickness */}
                        <Text style={styles.label}>Wire Thickness *</Text>

                        <TouchableOpacity
                            style={[styles.dropdown, { zIndex: 1000 }]}
                            onPress={() => setOpenDropdown("wireThickness")}
                            disabled={!structureWiring.wireManufacturer || loadingWireThickness}
                        >
                            <Text>
                                {structureWiring.wireThickness ||
                                    (loadingWireThickness
                                        ? "Loading wire thickness..."
                                        : "Select wire thickness")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "wireThickness" &&
                            wireThicknessOptions.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setStructureWiring({ ...structureWiring, wireThickness: item });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            ))}


                        {/* Wire Length */}
                        {/* Wire Length */}
                        <Text style={styles.label}>Wire Length *</Text>

                        <TouchableOpacity
                            style={[styles.dropdown, { zIndex: 1000 }]}
                            onPress={() => setOpenDropdown("wireLength")}
                            disabled={
                                !structureWiring.wireManufacturer ||
                                !structureWiring.wireThickness ||
                                loadingWireLength
                            }
                        >
                            <Text>
                                {structureWiring.wireLength ||
                                    (loadingWireLength
                                        ? "Loading wire length..."
                                        : "Select wire length")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "wireLength" &&
                            wireLengthOptions.map((len) => (
                                <TouchableOpacity
                                    key={len}
                                    style={[styles.dropdownItem, { zIndex: 2000 }]}
                                    onPress={() => {
                                        setStructureWiring(prev => ({
                                            ...prev,
                                            wireLength: len,
                                        }));
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{len}</Text>
                                </TouchableOpacity>
                            ))}



                    </>
                )}
                {/* STEP 6: ADDITIONAL COMPONENTS */}
                {currentStep === 6 && (
                    <>
                        {/* <Text style={styles.stepTitle}>Additional Components</Text> */}
                        <Text style={styles.subtitleSmall}>
                            Select additional components
                        </Text>

                        {/* AC / DC Box */}
                        {/* AC / DC Box */}
                        <Text style={styles.label}>AC / DC Box *</Text>

                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setOpenDropdown(openDropdown === "acDcBox" ? null : "acDcBox")
                            }
                        >
                            <Text>
                                {additionalComponents.acDcBox ||
                                    (loadingAcDcBox ? "Loading..." : "Select AC / DC Box")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "acDcBox" &&
                            acDcBoxOptions.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setAdditionalComponents({
                                            ...additionalComponents,
                                            acDcBox: item,
                                        });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            ))}


                        {/* Earthing */}
                        {/* Earthing */}
                        <Text style={styles.label}>Earthing *</Text>

                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setOpenDropdown(openDropdown === "earthing" ? null : "earthing")
                            }
                        >
                            <Text>
                                {additionalComponents.earthing ||
                                    (loadingEarthing ? "Loading..." : "Select earthing")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "earthing" &&
                            earthingOptions.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setAdditionalComponents({
                                            ...additionalComponents,
                                            earthing: item,
                                        });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            ))}


                        {/* Chemical */}
                        {/* Chemical & Anchoring */}
                        {/* Chemical & Anchoring */}
                        <Text style={styles.label}>Chemical & Anchoring *</Text>

                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setOpenDropdown(
                                    openDropdown === "chemicalAnchoring" ? null : "chemicalAnchoring"
                                )
                            }
                        >
                            <Text>
                                {additionalComponents.chemicalAnchoring ||
                                    (loadingChemicalAnchoring
                                        ? "Loading chemical & anchoring..."
                                        : "Select chemical & anchoring")}
                            </Text>
                        </TouchableOpacity>

                        {openDropdown === "chemicalAnchoring" &&
                            chemicalAnchoringOptions.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setAdditionalComponents({
                                            ...additionalComponents,
                                            chemicalAnchoring: item,
                                        });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            ))}


                    </>
                )}
                {/* STEP 7: REVIEW & SUBMIT */}
                {currentStep === 7 && reviewPreference && (
                    <>
                        <Text style={styles.stepTitle}>Review & Submit</Text>

                        <View style={styles.reviewGrid}>
                            {Object.entries(reviewPreference)
                                .filter(([key]) => key !== "prospect_id")
                                .map(([key, value]) => (
                                    <View
                                        key={key}
                                        style={{ flexDirection: "row", marginBottom: 8 }}
                                    >
                                        <Text style={styles.reviewLabel}>
                                            {key.replace(/_/g, " ")}
                                        </Text>
                                        <Text style={styles.reviewValue}>
                                            {String(value)}
                                        </Text>
                                    </View>
                                ))}

                        </View>
                        <View style={{ marginTop: 20 }}>
                            <TouchableOpacity
                                style={styles.nextBtn}
                                onPress={submitQuotation}
                            >
                                <Text style={styles.nextText}>Submit Quotation</Text>
                            </TouchableOpacity>
                        </View>

                    </>
                )}








                {/* PLACEHOLDER FOR OTHER STEPS */}
                {currentStep > 1 && (
                    <Text style={styles.placeholder}>
                        Step {currentStep} content will go here
                    </Text>
                )}
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                {/* PREVIOUS: ONLY FOR STEP < 7 */}
                {currentStep < 7 && (
                    <TouchableOpacity
                        disabled={currentStep === 1}
                        style={[
                            styles.prevBtn,
                            currentStep === 1 && styles.disabledBtn,
                        ]}
                        onPress={prevStep}
                    >
                        <Text style={styles.prevText}>Previous</Text>
                    </TouchableOpacity>
                )}

                {/* NEXT (STEP 1–5) */}
                {currentStep < 6 && (
                    <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
                        <Text style={styles.nextText}>Next</Text>
                    </TouchableOpacity>
                )}

                {/* SAVE (STEP 6) */}
                {currentStep === 6 && (
                    <TouchableOpacity style={styles.nextBtn} onPress={saveAndGoToReview}>
                        <Text style={styles.nextText}>Save</Text>
                    </TouchableOpacity>
                )}
            </View>



        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fb",
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    subtitle: {
        color: "#666",
        marginBottom: 16,
    },
    stepper: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    stepItem: {
        flex: 1,
        alignItems: "center",
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#e0e0e0",
        alignItems: "center",
        justifyContent: "center",
    },
    activeStep: {
        backgroundColor: "#2563eb",
    },
    completedStep: {
        backgroundColor: "#22c55e",
    },
    stepText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    stepLabel: {
        fontSize: 10,
        textAlign: "center",
        marginTop: 4,
        color: "#666",
    },
    activeLabel: {
        color: "#2563eb",
        fontWeight: "600",
    },

    activeStepText: {
        color: "#fff",
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 8,
    },
    planBox: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
    },
    selectedPlan: {
        borderColor: "#2563eb",
        backgroundColor: "#eef2ff",
    },
    planText: {
        fontSize: 14,
    },
    selectedPlanText: {
        fontWeight: "700",
        color: "#2563eb",
    },
    placeholder: {
        color: "#999",
        marginTop: 20,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    prevBtn: {
        padding: 12,
    },
    disabledBtn: {
        opacity: 0.4,
    },
    prevText: {
        color: "#444",
    },
    nextBtn: {
        backgroundColor: "#000",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    nextText: {
        color: "#fff",
        fontWeight: "700",
    },
    subtitleSmall: {
        color: "#666",
        marginBottom: 16,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 14,
        marginBottom: 8,
        backgroundColor: "#fff",
        zIndex: 1000,
    },
    dropdownItem: {
        padding: 14,
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 6,
        marginBottom: 6,
        backgroundColor: "#f9f9f9",
        zIndex: 2000,
        position: "relative",
    },
    reviewSection: {
        marginTop: 16,
        marginBottom: 6,
        fontWeight: "700",
        fontSize: 14,
    },
    reviewGrid: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 12,
    },
    reviewLabel: {
        width: "50%",
        color: "#555",
        fontSize: 15,
    },
    reviewValue: {
        width: "50%",
        fontWeight: "600",
        fontSize: 13,
    },
    reviewActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    editBtn: {
        backgroundColor: "#6b7280",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 6,
    },
    previewBtn: {
        backgroundColor: "#2563eb",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 6,
    },
    downloadBtn: {
        backgroundColor: "#16a34a",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginLeft: 6,
    },
    actionText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
    },



});
