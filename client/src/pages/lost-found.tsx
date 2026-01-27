import { useAuth } from "@/hooks/use-auth";
import { useLostFound, useCreateLostFound, useUpdateLostFound } from "@/hooks/use-lost-found";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Tag, Phone, Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLostFoundSchema, InsertLostFound, LostFound } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function LostFoundPage() {
  const { data: items, isLoading } = useLostFound();
  const updateItem = useUpdateLostFound();
  const [open, setOpen] = useState(false);

  const handleClaim = (id: number) => {
    updateItem.mutate({ id, status: "Claimed" });
  };

  const LostFoundGrid = ({ type, statusFilter }: { type: string, statusFilter?: string }) => {
    const filtered = items?.filter(item => 
      (type === "All" || item.type === type) && 
      (!statusFilter || item.status === statusFilter)
    ) || [];

    if (filtered.length === 0) return <div className="text-center p-12 text-muted-foreground">No items found.</div>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all group">
             {/* Abstract placeholder image with gradient overlay since we don't have real upload */}
             <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                <Search className="h-12 w-12 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                <Badge className={`absolute top-2 right-2 ${item.type === 'Lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                  {item.type}
                </Badge>
                {item.status === "Claimed" && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-bold border-2 border-white px-4 py-1 rounded-md transform -rotate-12">CLAIMED</span>
                   </div>
                )}
             </div>
             <CardHeader className="pb-2">
               <CardTitle className="text-lg">{item.title}</CardTitle>
               <CardDescription className="flex items-center gap-1 text-xs">
                 <MapPin className="h-3 w-3" /> {item.location} • {format(new Date(item.createdAt!), "MMM d")}
               </CardDescription>
             </CardHeader>
             <CardContent className="pb-2">
               <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
             </CardContent>
             <CardFooter className="pt-2 flex justify-between items-center border-t bg-muted/20">
               <div className="text-xs text-muted-foreground flex items-center gap-1">
                 <Phone className="h-3 w-3" /> {item.contact}
               </div>
               {item.status === "Open" && (
                 <Button size="sm" variant="outline" onClick={() => handleClaim(item.id)} disabled={updateItem.isPending}>
                   Mark Claimed
                 </Button>
               )}
             </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-display font-bold">Lost & Found</h1>
           <p className="text-muted-foreground">Report lost items or find what you're looking for.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20"><Plus className="mr-2 h-4 w-4" /> Report Item</Button>
          </DialogTrigger>
          <DialogContent>
             <DialogHeader><DialogTitle>Report Item</DialogTitle></DialogHeader>
             <LostFoundForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="lost" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="lost">Lost Items</TabsTrigger>
          <TabsTrigger value="found">Found Items</TabsTrigger>
          <TabsTrigger value="claimed">Claimed History</TabsTrigger>
        </TabsList>
        <TabsContent value="lost"><LostFoundGrid type="Lost" statusFilter="Open" /></TabsContent>
        <TabsContent value="found"><LostFoundGrid type="Found" statusFilter="Open" /></TabsContent>
        <TabsContent value="claimed"><LostFoundGrid type="All" statusFilter="Claimed" /></TabsContent>
      </Tabs>
    </div>
  );
}

function LostFoundForm({ onSuccess }: { onSuccess: () => void }) {
  const createItem = useCreateLostFound();
  const form = useForm<InsertLostFound>({
    resolver: zodResolver(insertLostFoundSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "Lost",
      location: "",
      contact: "",
      status: "Open",
    },
  });

  const onSubmit = (data: InsertLostFound) => {
    createItem.mutate(data, { onSuccess });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
           <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Lost">Lost Item</SelectItem>
                    <SelectItem value="Found">Found Item</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl><Input placeholder="Where?" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl><Input placeholder="Blue Wallet, Keys..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="Details about the item..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Info</FormLabel>
              <FormControl><Input placeholder="Phone or Room No." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={createItem.isPending}>
          {createItem.isPending ? "Submitting..." : "Submit Report"}
        </Button>
      </form>
    </Form>
  );
}
