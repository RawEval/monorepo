import { Metadata } from 'next';
import { SectionHeader } from '@raweval/ui/section-header';
import { Button } from '@raweval/ui/button';
import { Card, CardContent } from '@raweval/ui/card';
import { Input } from '@raweval/ui/input';
import { Textarea } from '@raweval/ui/textarea';
import { Label } from '@raweval/ui/label';
import { Mail, MessageSquare, Building2, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | RawEval',
  description: 'Get in touch with the RawEval team.',
};

export default function ContactPage() {
  return (
    <main className="bg-background min-h-screen pt-24 lg:pt-32">
      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <SectionHeader
          title="Contact Us"
          description="We'd love to hear from you. Choose the right channel or send us a message directly."
          className="mb-16"
        />

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Contact Channels */}
          <div className="space-y-6 lg:col-span-1">
            <h3 className="text-foreground mb-4 text-xl font-semibold">
              Direct Channels
            </h3>

            <Card className="transition-colors hover:border-blue-300">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex-shrink-0 rounded-lg bg-blue-100 p-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-foreground font-medium">Sales</h4>
                  <p className="text-muted-foreground mb-2 text-sm">
                    Enterprise inquiries & pricing
                  </p>
                  <a
                    href="mailto:sales@raweval.com"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    sales@raweval.com
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-colors hover:border-emerald-300">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex-shrink-0 rounded-lg bg-emerald-100 p-3">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-foreground font-medium">
                    Expert Support
                  </h4>
                  <p className="text-muted-foreground mb-2 text-sm">
                    Workbench & payment help
                  </p>
                  <a
                    href="mailto:experts@raweval.com"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    experts@raweval.com
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-colors hover:border-purple-300">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex-shrink-0 rounded-lg bg-purple-100 p-3">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-foreground font-medium">General Info</h4>
                  <p className="text-muted-foreground mb-2 text-sm">
                    Press & partnerships
                  </p>
                  <a
                    href="mailto:hello@raweval.com"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    hello@raweval.com
                  </a>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <h4 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
                <MapPin className="h-5 w-5 text-slate-500" />
                Our Headquarters
              </h4>
              <p className="text-muted-foreground ml-7 text-sm">
                548 Market St
                <br />
                San Francisco, CA 94104
                <br />
                United States
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-foreground mb-2 text-2xl font-bold">
                  Send us a message
                </h3>
                <p className="text-muted-foreground mb-8">
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </p>

                <form className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input id="first-name" placeholder="Jane" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input id="last-name" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your project..."
                      className="min-h-[150px]"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
