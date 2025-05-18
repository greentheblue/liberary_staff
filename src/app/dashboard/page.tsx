"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QRCodeScanner from "@/components/members/qr-code-scanner";
import { ScanLine, Phone, MapPin, User, School, CalendarDays, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  id: string;
  name: string;
  memberType: string;
  gender: string;
  phoneNumber: string;
  address: string;
  class?: string;
  division?: string;
  profilePic?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  availableCopies: number;
  category: {
    name: string;
  };
}

interface IssuedBookItem {
  id: string;
  bookId: string;
  collected: boolean;
  book: Book;
}

interface IssuedBook {
  id: string;
  issueDate: string;
  memberId: string;
  items: IssuedBookItem[];
}

export default function Dashboard() {
  const [memberId, setMemberId] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookId, setBookId] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [searchingBook, setSearchingBook] = useState(false);
  const [showIssueSection, setShowIssueSection] = useState(false);
  const [issuingBooks, setIssuingBooks] = useState(false);
  const [memberIssuedBooks, setMemberIssuedBooks] = useState<IssuedBook[]>([]);
  const [collectingBookId, setCollectingBookId] = useState<string | null>(null);
  const [showUncollectedBooksDialog, setShowUncollectedBooksDialog] =
    useState(false);
  const [checkingUncollectedBooks, setCheckingUncollectedBooks] =
    useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);  const searchMember = async (forceId?: string) => {
    // Use either the provided forceId or the memberId from state
    const idToSearch = forceId || memberId;
    
    if (!idToSearch) {
      toast.error("Please enter a member ID");
      return;
    }

    setLoading(true);
    // Reset states when searching for a new member
    setMember(null);
    setMemberIssuedBooks([]);
    setShowIssueSection(false);

    console.log("Searching for member with ID:", idToSearch);

    try {
      const response = await fetch(`/api/dashboard/members/${idToSearch}`);
      if (!response.ok) {
        throw new Error("Member not found");
      }

      const data = await response.json();
      setMember(data.member);

      // Only set issued books if they exist and have items
      if (data.issuedBooks && data.issuedBooks.length > 0) {
        // Filter out any issued books with no items
        const booksWithItems = data.issuedBooks.filter(
          (book: IssuedBook) => book.items && book.items.length > 0
        );
        setMemberIssuedBooks(booksWithItems);
      }
    } catch (error) {
      console.error("Error fetching member:", error);
      toast.error("Failed to find member");
      setMember(null);
      setMemberIssuedBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const searchBook = async () => {
    if (!bookId) {
      toast.error("Please enter a book ID");
      return;
    }

    setSearchingBook(true);
    try {
      const response = await fetch(`/api/dashboard/books/${bookId}`);
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Book not found");
        return;
      }

      const book = await response.json();

      // Check if book is already added
      if (selectedBooks.some((selectedBook) => selectedBook.id === book.id)) {
        toast.error("Book already added to the issue list");
        return;
      }

      setSelectedBooks([...selectedBooks, book]);
      setBookId("");
      toast.success("Book added to the issue list");
    } catch (error) {
      console.error("Error fetching book:", error);
      toast.error("Book not found");
    } finally {
      setSearchingBook(false);
    }
  };

  const removeSelectedBook = (id: string) => {
    setSelectedBooks(selectedBooks.filter((book) => book.id !== id));
  };
  const issueBooks = async () => {
    if (!member || selectedBooks.length === 0) {
      toast.error("Member and at least one book are required");
      return;
    }

    // Double-check for uncollected books before proceeding
    if (memberIssuedBooks.length > 0) {
      // Show the warning dialog instead of proceeding
      setShowUncollectedBooksDialog(true);
      return;
    }

    setIssuingBooks(true);
    try {
      const response = await fetch("/api/dashboard/issue-books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: member.id,
          bookIds: selectedBooks.map((book) => book.id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Check if the error is due to uncollected books
        if (errorData.uncollectedBooks) {
          setMemberIssuedBooks(errorData.uncollectedBooks);
          setShowUncollectedBooksDialog(true);
          throw new Error("Member has uncollected books");
        }

        throw new Error(errorData.error || "Failed to issue books");
      }

      const issuedBookData = await response.json();
      toast.success("Books issued successfully");

      // Clear the selected books and refresh member's books
      setSelectedBooks([]);
      setShowIssueSection(false);

      // Add the newly issued book to the list
      setMemberIssuedBooks([issuedBookData, ...memberIssuedBooks]);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to issue books");
      }
    } finally {
      setIssuingBooks(false);
    }
  };
  const markAsCollected = async (itemId: string) => {
    try {
      setCollectingBookId(itemId);
      const response = await fetch(`/api/dashboard/issued-items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collected: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as collected");
      }

      toast.success("Book marked as collected");

      // Find the book that was marked as collected
      let bookId = "";
      memberIssuedBooks.forEach((issuedBook) => {
        issuedBook.items.forEach((item) => {
          if (item.id === itemId) {
            bookId = item.bookId;
          }
        });
      });

      // Update the local state
      const updatedIssuedBooks = memberIssuedBooks
        .map((issuedBook) => {
          const updatedItems = issuedBook.items.filter(
            (item) => item.id !== itemId
          );
          // If no more uncollected items, remove the whole issue
          if (updatedItems.length === 0) {
            return null;
          }
          return {
            ...issuedBook,
            items: updatedItems,
          };
        })
        .filter(Boolean) as IssuedBook[];

      setMemberIssuedBooks(updatedIssuedBooks);

      // If all books are collected, close the dialog and allow issuing new books
      if (updatedIssuedBooks.length === 0) {
        setShowUncollectedBooksDialog(false);

        // If all books are collected, we can show the issue section
        if (showUncollectedBooksDialog) {
          setShowIssueSection(true);
        }
      }

      // Update book availability by incrementing by 1
      if (bookId) {
        await fetch(`/api/dashboard/books/${bookId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            incrementAvailableCopies: 1,
          }),
        });
      }
    } catch (error) {
      console.error("Error marking book as collected:", error);
      toast.error("Failed to mark book as collected");
    } finally {
      setCollectingBookId(null);
    }
  };
  const handleKeyPress = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter") {
      action();
    }
  };
  const handleQRCodeScan = async (scannedCode: string) => {
    // The QR code scanner component already validates that it's a 10-digit number
    setMemberId(scannedCode);
    toast.success(`QR code scanned: ${scannedCode}`);

    // Pass the scanned code directly to searchMember to avoid state timing issues
    searchMember(scannedCode);
  };

  const checkUncollectedBooks = () => {
    if (!member) return;

    // If we're already showing the issue section, hide it
    if (showIssueSection) {
      setShowIssueSection(false);
      return;
    }

    setCheckingUncollectedBooks(true);

    try {
      // Check if there are any uncollected books
      const hasUncollectedBooks = memberIssuedBooks.some(
        (issuedBook) => issuedBook.items && issuedBook.items.length > 0
      );

      if (hasUncollectedBooks) {
        // Show the dialog
        setShowUncollectedBooksDialog(true);
      } else {
        // Show the issue section directly if no uncollected books
        setShowIssueSection(true);
      }
    } catch (error) {
      console.error("Error checking uncollected books:", error);
      toast.error("Failed to check uncollected books");
    } finally {
      setCheckingUncollectedBooks(false);
    }
  };
  return (
    <div className="container px-4 sm:px-6 mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {/* Member Search Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Member Search</CardTitle>
          <CardDescription>
            Enter a member ID or scan QR code to search for a member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <Label htmlFor="memberId" className="mb-2 block">
                Member ID
              </Label>
              <Input
                id="memberId"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, () => searchMember())}
                placeholder="Enter member ID"
                className="w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                variant="outline"
                onClick={() => setIsQRScannerOpen(true)}
                className="flex-1 sm:flex-none"
              >
                <ScanLine className="h-4 w-4 mr-2" />
                Scan QR
              </Button>
              <Button
                onClick={() => searchMember()}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>      {/* Member Details Section */}
      {member && (
        <Card className="mb-6">
          <CardHeader className="pb-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-blue-100 dark:border-blue-900/50">
              {member.profilePic ? (
                <AvatarImage 
                  src={member.profilePic} 
                  alt={member.name} 
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold">{member.name}</h2>
                <Badge className="capitalize">
                  {member.memberType.toLowerCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">ID: {member.id}</p>
              
              <div className="flex flex-wrap mt-2 gap-2">
                <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {member.gender}
                </Badge>
                {member.class && (
                  <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
                    <School className="h-3.5 w-3.5" />
                    Class {member.class} {member.division && `- ${member.division}`}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 pb-4">
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{member.phoneNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{member.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>          </CardContent>
          
          <CardFooter className="pt-0 border-t">
            <Button
              variant="outline"
              onClick={checkUncollectedBooks}
              disabled={checkingUncollectedBooks}
              className={memberIssuedBooks.length > 0 ? "relative" : ""}
            >
              {showIssueSection
                ? "Hide Issue Section"
                : checkingUncollectedBooks
                ? "Checking..."
                : "Issue Books"}

              {/* Add a visual indicator if member has uncollected books */}
              {memberIssuedBooks.length > 0 && !showIssueSection && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
                  <span className="sr-only">Uncollected books</span>
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}{/* Currently Issued Books Section */}
      {member && memberIssuedBooks.length > 0 && (
        <Card className="mb-6 border border-red-200 overflow-hidden">
          <div className="bg-red-50 dark:bg-red-950/20 px-6 py-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">Currently Issued Books</CardTitle>
              <Badge variant="destructive" className="animate-pulse">
                Uncollected
              </Badge>
            </div>
            <CardDescription>
              These books have been issued to this member and must be collected
              before new books can be issued
            </CardDescription>
          </div>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-3">
                {memberIssuedBooks.map((issuedBook) => (
                  <div key={issuedBook.id} className="bg-card border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-4 py-2 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">
                          Issue ID: {issuedBook.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Issued on:{" "}
                          {new Date(issuedBook.issueDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-2">
                      {issuedBook.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-background rounded-lg border border-muted-foreground/10 hover:border-muted-foreground/20 transition-colors"
                        >
                          <div className="space-y-1">
                            <h4 className="font-medium">{item.book.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.book.author}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.book.category.name}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Book ID: {item.bookId}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => markAsCollected(item.id)}
                            disabled={collectingBookId === item.id}
                            className="mt-2 sm:mt-0 min-w-[140px]"
                          >
                            {collectingBookId === item.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Marking...
                              </>
                            ) : (
                              "Mark as Collected"
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}      {/* Book Issue Section */}
      {member && showIssueSection && (
        <Card className="mb-6 overflow-hidden">
          <div className="bg-blue-50 dark:bg-blue-950/20 px-6 py-2">
            <CardTitle className="text-xl">Issue Books</CardTitle>
            <CardDescription>
              Search for books by ID and add them to the issue list
            </CardDescription>
          </div>
          <CardContent className="p-4 pt-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="bookId" className="mb-2 block">
                    Book ID
                  </Label>
                  <Input
                    id="bookId"
                    value={bookId}
                    onChange={(e) => setBookId(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, searchBook)}
                    placeholder="Enter book ID"
                    className="w-full"
                  />
                </div>
                <Button 
                  onClick={searchBook} 
                  disabled={searchingBook}
                  className="w-full sm:w-auto mt-2 sm:mt-0"
                >
                  {searchingBook ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>

              {selectedBooks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-lg">Selected Books ({selectedBooks.length})</h3>
                    <Badge variant="secondary">{selectedBooks.length} {selectedBooks.length === 1 ? "book" : "books"} selected</Badge>
                  </div>
                  <ScrollArea className="h-[280px] rounded-lg border">
                    <div className="p-3 space-y-3">
                      {selectedBooks.map((book) => (
                        <div
                          key={book.id}
                          className="flex flex-col sm:flex-row justify-between gap-3 p-3 bg-muted/20 border rounded-lg"
                        >
                          <div className="space-y-1">
                            <h4 className="font-medium">{book.title}</h4>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline">
                                {book.category.name}
                              </Badge>
                              <Badge variant="secondary">
                                Available: {book.availableCopies}
                              </Badge>
                              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20">
                                ID: {book.id}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSelectedBook(book.id)}
                            className="mt-2 sm:mt-0 self-start sm:self-center"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="px-6 py-4 border-t bg-muted/20">
            <Button
              disabled={selectedBooks.length === 0 || issuingBooks}
              onClick={issueBooks}
              className="w-full"
              size="lg"
            >
              {issuingBooks ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Issuing Books...
                </>
              ) : (
                `Issue ${selectedBooks.length} Book${
                  selectedBooks.length !== 1 ? "s" : ""
                } to ${member.name}`
              )}
            </Button>
          </CardFooter>
        </Card>
      )}{" "}      {/* Dialog for uncollected books warning */}
      <Dialog
        open={showUncollectedBooksDialog}
        onOpenChange={setShowUncollectedBooksDialog}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30">
                <span className="text-lg">⚠️</span>
              </div>
              Uncollected Books Warning
            </DialogTitle>
            <DialogDescription className="pt-2">
              This member has uncollected books. They must collect all previous
              books before new books can be issued.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-3 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-3">Uncollected Books:</h4>
            <ScrollArea className="h-[260px]">
              <div className="space-y-4">
                {memberIssuedBooks.map((issuedBook) => (
                  <div key={issuedBook.id} className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-muted-foreground">
                        Issued on:{" "}
                        {new Date(issuedBook.issueDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </p>
                      <p className="text-xs font-medium">{issuedBook.id}</p>
                    </div>
                    <div className="space-y-2">
                      {issuedBook.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-card p-3 rounded-md border"
                        >
                          <div>
                            <p className="font-medium text-sm">{item.book.title}</p>
                            <p className="text-xs text-muted-foreground">{item.book.author}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.book.category.name}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                ID: {item.bookId}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setShowUncollectedBooksDialog(false);
                              markAsCollected(item.id);
                            }}
                            disabled={collectingBookId === item.id}
                            className="min-w-[110px]"
                          >
                            {collectingBookId === item.id ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Marking...
                              </>
                            ) : (
                              "Mark Collected"
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowUncollectedBooksDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Empty state */}
      {!member && (
        <div className="text-center py-12 px-4 border rounded-lg bg-muted/30 flex flex-col items-center justify-center gap-3">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
            <User className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-medium text-lg">Search for a member to begin</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Enter a member ID above or use the QR scanner to search for a member and issue books
          </p>
        </div>
      )}
      {/* QR Code Scanner Dialog */}
      <QRCodeScanner
        open={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRCodeScan}
      />
    </div>
  );
}
