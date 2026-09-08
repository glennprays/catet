import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Settings2 } from "lucide-react";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
      {children}
    </p>
  );
}

export default function PrimitivesPage() {
  return (
    <div className="min-h-full bg-canvas text-ink font-sans">
      <div className="mx-auto max-w-3xl space-y-8 p-6">
        <div>
          <h1 className="text-[26px] font-medium leading-[1.15] tracking-[-0.015em]">
            Primitives
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Paper Ledger component foundation — dev scaffolding.
          </p>
        </div>

        <section className="space-y-3">
          <SectionLabel>Buttons</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            <Button>Simpan</Button>
            <Button variant="secondary">Simpan</Button>
            <Button variant="outline">Simpan</Button>
            <Button variant="ghost">Simpan</Button>
            <Button variant="dangerGhost">Hapus</Button>
            <Button variant="destructive">Hapus</Button>
            <Button variant="link">Lihat semua</Button>
            <Button disabled>Disabled</Button>
            <Button disabled>
              <Loader2 className="size-3.5 animate-spin" />
              Menyimpan…
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <SectionLabel>Badges</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Makanan</Badge>
            <Badge variant="safe">Aman</Badge>
            <Badge variant="warn">Menipis</Badge>
            <Badge variant="over">Lebih</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        <section className="space-y-3">
          <SectionLabel>Card</SectionLabel>
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>Total tersedia</CardTitle>
              <CardDescription>Saldo gabungan semua sumber</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[40px] font-medium leading-[1.05] tracking-[-0.01em] tabular-nums text-safe-text">
                Rp9.073.500
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Kelola sumber</Button>
            </CardFooter>
          </Card>
        </section>

        <section className="space-y-3">
          <SectionLabel>Form wells</SectionLabel>
          <div className="grid max-w-sm gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <Input id="nama" placeholder="Kopi pagi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan</Label>
              <Textarea id="catatan" placeholder="Opsional" />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="makanan">Makanan</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-[13px]">
                <Checkbox /> Esensial
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <Switch /> Aktif
              </label>
            </div>
            <RadioGroup defaultValue="expense">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense">Pengeluaran</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income">Pemasukan</Label>
              </div>
            </RadioGroup>
          </div>
        </section>

        <section className="space-y-3">
          <SectionLabel>Segmented</SectionLabel>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="transactions">Transaksi</TabsTrigger>
              <TabsTrigger value="analytics">Analitik</TabsTrigger>
            </TabsList>
          </Tabs>
        </section>

        <section className="space-y-3">
          <SectionLabel>Floaters</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Hapus transaksi?</DialogTitle>
                  <DialogDescription>
                    Tindakan ini dapat dibatalkan dari keranjang pulih.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet</Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Ubah transaksi</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Ubah</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Hapus</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pengaturan</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Popover</Button>
              </PopoverTrigger>
              <PopoverContent>Konten popover.</PopoverContent>
            </Popover>
          </div>
        </section>

        <section className="space-y-3">
          <SectionLabel>Data</SectionLabel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Kopi pagi</TableCell>
                <TableCell>Makanan</TableCell>
                <TableCell className="text-right tabular-nums">−Rp25.000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gojek</TableCell>
                <TableCell>Transport</TableCell>
                <TableCell className="text-right tabular-nums">−Rp18.000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gajian</TableCell>
                <TableCell>Pemasukan</TableCell>
                <TableCell className="text-right tabular-nums text-safe-text">
                  +Rp8.000.000
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-2/3" />
          </div>
          <Separator />
          <Calendar />
        </section>
      </div>
    </div>
  );
}
