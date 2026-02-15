import React from 'react';
import { DesignSettings } from '../types';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DesignControlsProps {
    settings: DesignSettings;
    onUpdate: (field: keyof DesignSettings, value: number | string) => void;
}

export function DesignControls({ settings, onUpdate }: DesignControlsProps) {
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Design Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Font Size */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="fontSize" className="text-sm font-medium">Base Font Size</Label>
                        <span className="text-xs text-muted-foreground">{settings.fontSize}rem</span>
                    </div>
                    <Slider
                        id="fontSize"
                        min={0.8}
                        max={1.4}
                        step={0.05}
                        value={[settings.fontSize]}
                        onValueChange={(vals) => onUpdate('fontSize', vals[0])}
                    />
                </div>

                {/* Line Height */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="lineHeight" className="text-sm font-medium">Line Height</Label>
                        <span className="text-xs text-muted-foreground">{settings.lineHeight}</span>
                    </div>
                    <Slider
                        id="lineHeight"
                        min={1}
                        max={2}
                        step={0.1}
                        value={[settings.lineHeight]}
                        onValueChange={(vals) => onUpdate('lineHeight', vals[0])}
                    />
                </div>

                {/* Section Spacing */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="sectionSpacing" className="text-sm font-medium">Section Spacing</Label>
                        <span className="text-xs text-muted-foreground">{settings.sectionSpacing}rem</span>
                    </div>
                    <Slider
                        id="sectionSpacing"
                        min={0.5}
                        max={3}
                        step={0.25}
                        value={[settings.sectionSpacing]}
                        onValueChange={(vals) => onUpdate('sectionSpacing', vals[0])}
                    />
                </div>

                {/* Item Spacing */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="itemSpacing" className="text-sm font-medium">Item Spacing</Label>
                        <span className="text-xs text-muted-foreground">{settings.itemSpacing}rem</span>
                    </div>
                    <Slider
                        id="itemSpacing"
                        min={0.5}
                        max={2}
                        step={0.25}
                        value={[settings.itemSpacing]}
                        onValueChange={(vals) => onUpdate('itemSpacing', vals[0])}
                    />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="fontColor" className="text-sm font-medium">Text Color</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="fontColor"
                                type="color"
                                value={settings.fontColor}
                                onChange={(e) => onUpdate('fontColor', e.target.value)}
                                className="w-12 h-8 p-1 cursor-pointer"
                            />
                            <span className="text-xs text-muted-foreground">{settings.fontColor}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="primaryColor" className="text-sm font-medium">Accent Color</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="primaryColor"
                                type="color"
                                value={settings.primaryColor}
                                onChange={(e) => onUpdate('primaryColor', e.target.value)}
                                className="w-12 h-8 p-1 cursor-pointer"
                            />
                            <span className="text-xs text-muted-foreground">{settings.primaryColor}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
