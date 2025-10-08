import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false; // This ensures the endpoint is server-rendered

export const POST: APIRoute = async ({ request }) => {
	try {
		const data = await request.json();
		const { name, phone, email, restaurant } = data;

		// Validate required fields
		if (!name || !phone || !email || !restaurant) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Todos los campos son requeridos',
				}),
				{ status: 400 }
			);
		}

		// Get env vars using import.meta.env (Astro way)
		const smtpUser = import.meta.env.SMTP_USER;
		const smtpPass = import.meta.env.SMTP_PASS;
		const smtpHost = import.meta.env.SMTP_HOST || 'smtpout.secureserver.net';
		const smtpPort = parseInt(import.meta.env.SMTP_PORT || '587');

		console.log('Env check - User exists:', !!smtpUser, 'Pass exists:', !!smtpPass);

		if (!smtpUser || !smtpPass) {
			console.error('Missing SMTP credentials in environment variables');
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Error de configuración del servidor',
				}),
				{ status: 500 }
			);
		}

		// Create transporter with GoDaddy SMTP
		const transporter = nodemailer.createTransport({
			host: smtpHost,
			port: smtpPort,
			secure: false, // false for 587, true for 465
			auth: {
				user: smtpUser,
				pass: smtpPass,
			},
			tls: {
				rejectUnauthorized: false,
			},
		});

		// Email to Avoqado
		await transporter.sendMail({
			from: smtpUser,
			to: 'hola@avoqado.io',
			subject: `Nueva solicitud de demo - ${restaurant}`,
			html: `
				<h2>Nueva solicitud de demo</h2>
				<p><strong>Nombre:</strong> ${name}</p>
				<p><strong>Teléfono:</strong> ${phone}</p>
				<p><strong>Email:</strong> ${email}</p>
				<p><strong>Restaurante:</strong> ${restaurant}</p>
				<hr>
				<p><em>Enviado desde avoqado.io</em></p>
			`,
		});

		// Confirmation email to user
		await transporter.sendMail({
			from: smtpUser,
			to: email,
			subject: 'Solicitud de demo recibida - Avoqado',
			html: `
				<h2>¡Gracias por tu interés en Avoqado!</h2>
				<p>Hola ${name},</p>
				<p>Hemos recibido tu solicitud de demo para <strong>${restaurant}</strong>.</p>
				<p>Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas.</p>
				<br>
				<p>Saludos,<br>El equipo de Avoqado</p>
				<hr>
				<p><small>Este es un correo automático, por favor no respondas a este mensaje.</small></p>
			`,
		});

		return new Response(
			JSON.stringify({
				success: true,
				message: 'Demo solicitada exitosamente',
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error sending email:', error);
		return new Response(
			JSON.stringify({
				success: false,
				message: 'Error al enviar la solicitud',
			}),
			{ status: 500 }
		);
	}
};
