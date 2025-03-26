
import { Card, CardContent } from "@/components/ui/card";
import { LucideMessageSquare } from "lucide-react";

interface FeedbackItemProps {
  feedback: string;
  date: string;
  teacherName?: string;
}

const FeedbackItem = ({ feedback, date, teacherName }: FeedbackItemProps) => {
  return (
    <Card className="border border-border bg-muted/30">
      <CardContent className="p-3">
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
            <LucideMessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {teacherName && (
                <p className="text-sm font-medium">{teacherName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(date).toLocaleDateString()}
              </p>
            </div>
            <p className="text-sm">{feedback}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackItem;
