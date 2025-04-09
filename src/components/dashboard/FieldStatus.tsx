
import React from "react";
import { Droplet, Sprout, AlertTriangle, AreaChart } from "lucide-react";

type FieldData = {
  id: string;
  name: string;
  crop: string;
  soilMoisture: number;
  growthStage: string;
  lastAction: string;
  healthStatus: "good" | "warning" | "alert";
  alerts?: {
    type: string;
    message: string;
  }[];
};

// Sample field data
const fieldsData: FieldData[] = [
  {
    id: "field1",
    name: "North Field",
    crop: "Corn",
    soilMoisture: 72,
    growthStage: "Vegetative",
    lastAction: "Irrigation (3 days ago)",
    healthStatus: "good"
  },
  {
    id: "field2",
    name: "East Field",
    crop: "Wheat",
    soilMoisture: 45,
    growthStage: "Ripening",
    lastAction: "Fertilizer (1 week ago)",
    healthStatus: "warning",
    alerts: [
      {
        type: "moisture",
        message: "Soil moisture below optimal level"
      }
    ]
  },
  {
    id: "field3",
    name: "South Field",
    crop: "Soybeans",
    soilMoisture: 68,
    growthStage: "Flowering",
    lastAction: "Pest control (5 days ago)",
    healthStatus: "alert",
    alerts: [
      {
        type: "pests",
        message: "Possible aphid infestation detected"
      }
    ]
  }
];

const FieldStatus = () => {
  const getMoistureColor = (level: number) => {
    if (level >= 65) return "text-blue-500";
    if (level >= 45) return "text-yellow-500";
    return "text-red-500";
  };

  const getHealthIcon = (status: FieldData["healthStatus"]) => {
    switch (status) {
      case "good":
        return <Sprout className="h-5 w-5 text-agrifirm-green" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-agrifirm-black">Field Status</h2>
      
      <div className="space-y-4">
        {fieldsData.map((field) => (
          <div 
            key={field.id}
            className={`farm-card ${
              field.healthStatus === "alert" 
                ? "border-red-300 bg-red-50" 
                : field.healthStatus === "warning"
                ? "border-yellow-300 bg-yellow-50"
                : ""
            }`}
          >
            <div className="flex justify-between">
              <h3 className="font-semibold text-agrifirm-black">{field.name}</h3>
              {getHealthIcon(field.healthStatus)}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-agrifirm-brown-dark">{field.crop}</span>
              <span className="text-xs px-2 py-0.5 bg-agrifirm-light-green/20 text-agrifirm-green rounded-full">
                {field.growthStage}
              </span>
            </div>
            
            <div className="mt-3 flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Droplet className={`h-4 w-4 ${getMoistureColor(field.soilMoisture)}`} />
                <span className="text-sm">Moisture: {field.soilMoisture}%</span>
              </div>
              <div className="flex items-center gap-1">
                <AreaChart className="h-4 w-4 text-agrifirm-grey" />
                <span className="text-sm">{field.lastAction}</span>
              </div>
            </div>
            
            {field.alerts && field.alerts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-agrifirm-light-green/20">
                {field.alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldStatus;
