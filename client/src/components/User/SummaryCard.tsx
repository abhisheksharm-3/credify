import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardData } from "@/lib/types";

export function SummaryCard({ title, description, value }: CardData) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}