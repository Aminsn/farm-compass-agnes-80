
import React from "react";
import { Tractor } from "lucide-react";

const AdvisorInfo = () => {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h2 className="text-xl font-semibold mb-4">In-Person Support</h2>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-agrifirm-light-green/20 flex items-center justify-center">
          <Tractor className="h-8 w-8 text-agrifirm-green" />
        </div>
        <div>
          <h3 className="font-medium text-lg">Field Visits & Consultation</h3>
          <p className="text-gray-500">Expert on-site assistance</p>
        </div>
      </div>
      <p className="text-gray-600 mb-4">
        Your advisor can visit your farm for hands-on assessment and personalized recommendations.
        In-person visits are ideal for complex issues requiring direct observation of crops, soil,
        or equipment.
      </p>
      <div className="bg-agrifirm-light-yellow-2/30 rounded p-3 text-sm">
        <strong>Scheduling:</strong> Visits are typically arranged within 1-2 weeks of request,
        subject to advisor availability. Emergency visits may be available within 48 hours.
      </div>
    </div>
  );
};

export default AdvisorInfo;
