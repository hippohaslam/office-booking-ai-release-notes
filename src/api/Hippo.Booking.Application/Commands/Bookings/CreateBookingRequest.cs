using FluentValidation;
using Hippo.Booking.Core.Interfaces;

namespace Hippo.Booking.Application.Commands.Bookings;

public class CreateBookingRequest
{
    public int BookableObjectId { get; set; }

    public int AreaId { get; set; }

    public DateOnly Date { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string UserEmail { get; set; } = string.Empty;
}

public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    public CreateBookingRequestValidator(IDateTimeProvider dateTimeProvider)
    {
        RuleFor(x => x.BookableObjectId).NotEmpty();
        RuleFor(x => x.AreaId).NotEmpty();
        RuleFor(x => x.Date).NotEmpty()
            .GreaterThanOrEqualTo(dateTimeProvider.Today)
            .LessThanOrEqualTo(dateTimeProvider.Today.AddDays(42)); // 6 weeks
        RuleFor(x => x.UserId).NotEmpty();
    }
}