import { Request, Response } from 'express';
import { AppDataSource } from "../db/data-source";
import { ContactUs } from "../entities/ContactUs";
// import { validate } from 'class-validator';

export class ContactUsController {
    /**
     * Create a new contact us submission
     * POST /api/contact-us
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const { name, email, phone, description } = req.body;

            // Validation
            if (!name || !email || !phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and phone are required fields',
                });
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                });
            }

            // Phone validation (basic)
            const phoneRegex = /^[0-9+\-\s()]+$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number format',
                });
            }

            // Get repository
            const contactUsRepository = AppDataSource.getRepository(ContactUs);

            // Create new contact us entry
            const contactUs = new ContactUs();
            contactUs.name = name.trim();
            contactUs.email = email.trim().toLowerCase();
            contactUs.phone = phone.trim();
            contactUs.description = description ? description.trim() : null;
            contactUs.status = 'pending';

            // Save to database
            const savedContact = await contactUsRepository.save(contactUs);

            // TODO: Send email notification to admin
            // await sendEmailNotification(savedContact);

            return res.status(201).json({
                success: true,
                message: 'Thank you for contacting us! We will get back to you soon.',
                data: {
                    id: savedContact.id,
                    name: savedContact.name,
                    email: savedContact.email,
                    createdAt: savedContact.createdAt,
                },
            });
        } catch (error: any) {
            console.error('Error creating contact us entry:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while processing your request',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }

    /**
     * Get all contact us submissions (Admin only)
     * GET /api/contact-us
     */
    static getAll = async (req: Request, res: Response) => {
        try {
            const { status, page = 1, limit = 10 } = req.query;

            const contactUsRepository = AppDataSource.getRepository(ContactUs);

            // Build query
            const queryBuilder = contactUsRepository.createQueryBuilder('contact');

            // Filter by status if provided
            if (status) {
                queryBuilder.where('contact.status = :status', { status });
            }

            // Pagination
            const skip = (Number(page) - 1) * Number(limit);
            queryBuilder.skip(skip).take(Number(limit));

            // Order by created date (newest first)
            queryBuilder.orderBy('contact.created_at', 'DESC');

            // Execute query
            const [contacts, total] = await queryBuilder.getManyAndCount();

            // return res.status(200).json({
            //     success: true,
            //     data: contacts,
            //     pagination: {
            //         total,
            //         page: Number(page),
            //         limit: Number(limit),
            //         totalPages: Math.ceil(total / Number(limit)),
            //     },
            // });
            return res.render("contact/list", {
                contacts,
                pagination: {      total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit)),
                },
            });
        } catch (error) {
            console.error('Error fetching contact us entries:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching contact submissions',
            });
        }
    }

    /**
     * Get single contact us submission by ID (Admin only)
     * GET /api/contact-us/:id
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const contactUsRepository = AppDataSource.getRepository(ContactUs);
            const contact = await contactUsRepository.findOne({
                where: { id: Number(id) },
            });

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact submission not found',
                });
            }

            return res.status(200).json({
                success: true,
                data: contact,
            });
        } catch (error) {
            console.error('Error fetching contact us entry:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching the contact submission',
            });
        }
    }

    /**
     * Update contact us status (Admin only)
     * PATCH /api/contact-us/:id/status
     */
    static async updateStatus(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required',
                });
            }

            const validStatuses = ['pending', 'contacted', 'resolved'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be one of: pending, contacted, resolved',
                });
            }

            const contactUsRepository = AppDataSource.getRepository(ContactUs);
            const contact = await contactUsRepository.findOne({
                where: { id: Number(id) },
            });

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact submission not found',
                });
            }

            contact.status = status;
            await contactUsRepository.save(contact);

            return res.status(200).json({
                success: true,
                message: 'Status updated successfully',
                data: contact,
            });
        } catch (error) {
            console.error('Error updating contact us status:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while updating the status',
            });
        }
    }

    /**
     * Delete contact us submission (Admin only)
     * DELETE /api/contact-us/:id
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const contactUsRepository = AppDataSource.getRepository(ContactUs);
            const contact = await contactUsRepository.findOne({
                where: { id: Number(id) },
            });

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact submission not found',
                });
            }

            await contactUsRepository.remove(contact);

            return res.status(200).json({
                status: "success",
                success: true,
                message: 'Contact submission deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting contact us entry:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while deleting the contact submission',
            });
        }
    }
}