using System.Runtime.Serialization;

namespace DoorPasses.Models
{
    /// <summary>
    /// Access Pass state
    /// </summary>
    public enum AccessPassState
    {
        [EnumMember(Value = "active")]
        Active,

        [EnumMember(Value = "suspended")]
        Suspended,

        [EnumMember(Value = "unlinked")]
        Unlinked,

        [EnumMember(Value = "deleted")]
        Deleted,

        [EnumMember(Value = "expired")]
        Expired
    }

    /// <summary>
    /// Platform type
    /// </summary>
    public enum Platform
    {
        [EnumMember(Value = "apple")]
        Apple,

        [EnumMember(Value = "google")]
        Google
    }

    /// <summary>
    /// Protocol type
    /// </summary>
    public enum Protocol
    {
        [EnumMember(Value = "desfire")]
        Desfire,

        [EnumMember(Value = "seos")]
        Seos,

        [EnumMember(Value = "smart_tap")]
        SmartTap
    }

    /// <summary>
    /// Employment classification
    /// </summary>
    public enum Classification
    {
        [EnumMember(Value = "full_time")]
        FullTime,

        [EnumMember(Value = "contractor")]
        Contractor,

        [EnumMember(Value = "part_time")]
        PartTime,

        [EnumMember(Value = "temporary")]
        Temporary
    }

    /// <summary>
    /// Use case type
    /// </summary>
    public enum UseCase
    {
        [EnumMember(Value = "employee_badge")]
        EmployeeBadge,

        [EnumMember(Value = "hotel")]
        Hotel
    }

    /// <summary>
    /// Device type
    /// </summary>
    public enum DeviceType
    {
        [EnumMember(Value = "mobile")]
        Mobile,

        [EnumMember(Value = "watch")]
        Watch
    }

    /// <summary>
    /// Event type
    /// </summary>
    public enum EventType
    {
        [EnumMember(Value = "issue")]
        Issue,

        [EnumMember(Value = "install")]
        Install,

        [EnumMember(Value = "update")]
        Update,

        [EnumMember(Value = "suspend")]
        Suspend,

        [EnumMember(Value = "resume")]
        Resume,

        [EnumMember(Value = "unlink")]
        Unlink
    }
}
