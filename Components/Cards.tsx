import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface CardType {
  title: string;
  value: number | string;
  icon?: React.ComponentType<any>; // Icon component from lucide-react
  color?: string; // Tailwind color class for icon
}

interface CardsProps {
  cardData?: CardType[];
  onRefresh?: () => void; // callback for refresh
}

const Cards: React.FC<CardsProps> = ({ cardData = [], onRefresh }) => {
  return (
    <div className="px-4 py-6 ">
      {/* Refresh Button */}
      {onRefresh && (
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onRefresh}
          >
            <RotateCw size={16} className="animate-spin-slow" />
            Tap to Refresh
          </Button>
        </div>
      )}

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="p-5 cursor-pointer flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-xl shadow-md dark:shadow-none rounded-xl"
            >
              <CardHeader className="p-0 flex justify-between items-start">
                <CardTitle className="text-sm text-gray-500 dark:text-gray-400">
                  {card.title}
                </CardTitle>
                {Icon && <Icon size={24} className={`${card.color}`} />}
              </CardHeader>

              <CardContent className="p-0 mt-2">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Cards;
