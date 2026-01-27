import { useAuth } from "@/hooks/use-auth";
import { useAnnouncements, useCreateAnnouncement } from "@/hooks/use-announcements";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Calendar, Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAnnouncementSchema, InsertAnnouncement } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";

export default function Announcements() {
  const { user } = useAuth();
  const { data: announcements, isLoading } = useAnnouncements();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-display font-bold">Announcements</h1>
           <p className="text-muted-foreground">Stay updated with the latest hostel news.</p>
        </div>
        
        {user?.role === "admin" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20"><Plus className="mr-2 h-4 w-4" /> New Announcement</Button>
            </DialogTrigger>
            <DialogContent>
               <DialogHeader>
                 <DialogTitle>Post Announcement</DialogTitle>
               </DialogHeader>
               <AnnouncementForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
      ) : (
        <div className="space-y-4">
          {announcements?.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No announcements yet.</p>
          ) : (
            announcements?.map(announcement => (
              <Card key={announcement.id} className={`transition-all hover:shadow-md ${announcement.urgent ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      {announcement.urgent && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold mb-2">URGENT</span>
                      )}
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" /> {format(new Date(announcement.createdAt!), "PPP")}
                        <span>•</span>
                        <span>Target: {announcement.target || "All"}</span>
                      </CardDescription>
                    </div>
                    <Megaphone className={`h-6 w-6 ${announcement.urgent ? 'text-red-500' : 'text-primary'}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-foreground/90">{announcement.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AnnouncementForm({ onSuccess }: { onSuccess: () => void }) {
  const createAnnouncement = useCreateAnnouncement();
  const form = useForm<InsertAnnouncement>({
    resolver: zodResolver(insertAnnouncementSchema),
    defaultValues: {
      title: "",
      content: "",
      target: "All",
      urgent: false,
    },
  });

  const onSubmit = (data: InsertAnnouncement) => {
    createAnnouncement.mutate(data, { onSuccess });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="Water Supply Interruption" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl><Textarea placeholder="Details..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience</FormLabel>
              <FormControl><Input placeholder="All, Block A, etc." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="urgent"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Urgent</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={createAnnouncement.isPending}>
          {createAnnouncement.isPending ? "Posting..." : "Post Announcement"}
        </Button>
      </form>
    </Form>
  );
}
