import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    const { schoolId } = await params;

    try {
        const setting = await prisma.setting.findUnique({
            where: { schoolId },
            include: { classes: true },
        });

        if (!setting) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        return NextResponse.json(setting);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    const { schoolId } = await params;

    try {
        const data = await req.json();

        const {
            schoolName,
            slogan,
            adminName,
            adminEmail,
            password,
            logoBase64,
            adminImageBase64,
            classes,
            transportFees,
        } = data;

        const existingSetting = await prisma.setting.findUnique({
            where: { schoolId },
            include: { classes: true },
        });

        if (!existingSetting) {
            return NextResponse.json(
                { success: false, error: 'School settings not found. Please create settings first.' },
                { status: 404 }
            );
        }

        // Delete existing classes first
        await prisma.class.deleteMany({
            where: { settingId: existingSetting.id },
        });

        const updatedSetting = await prisma.setting.update({
            where: { schoolId },
            data: {
                schoolName,
                slogan,
                adminName,
                adminEmail,
                password,
                logoBase64: logoBase64 ?? '',
                adminImageBase64: adminImageBase64 ?? '',
                transportFeeBelow3: transportFees?.below3 ? parseFloat(transportFees.below3) : null,
                transportFeeBetween3and5: transportFees?.between3and5
                    ? parseFloat(transportFees.between3and5)
                    : null,
                transportFeeBetween5and10: transportFees?.between5and10
                    ? parseFloat(transportFees.between5and10)
                    : null,
                transportFeeAbove10: transportFees?.above10 ? parseFloat(transportFees.above10) : null,
                classes: {
                    create: classes.map((cls: any) => ({
                        name: cls.name,
                        tuitionFee: parseFloat(cls.tuitionFee),
                        admissionFee: parseFloat(cls.admissionFee),
                    })),
                },
            },
            include: { classes: true },
        });

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully',
            data: updatedSetting,
        });
    } catch (error) {
        console.error('Update API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    const { schoolId } = await params;

    try {
        const existingSetting = await prisma.setting.findUnique({
            where: { schoolId },
        });

        if (!existingSetting) {
            return NextResponse.json(
                { success: false, error: 'School settings not found' },
                { status: 404 }
            );
        }

        // Delete classes first (foreign key constraint)
        await prisma.class.deleteMany({
            where: { settingId: existingSetting.id },
        });

        await prisma.setting.delete({
            where: { schoolId },
        });

        return NextResponse.json({ success: true, message: 'Settings deleted successfully' });
    } catch (error) {
        console.error('Delete API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete settings' },
            { status: 500 }
        );
    }
}
