import enum
import typing

from flask_wtf import FlaskForm

import pcapi.utils.email as email_utils


class PCForm(FlaskForm):
    def filter_email(self, raw_email: str | None) -> str:
        if not raw_email:
            return ""
        return email_utils.sanitize_email(raw_email)

    @property
    def raw_data(self) -> dict[str, typing.Any]:
        return {field.name: field.raw_data for field in self}


def choices_from_enum(
    enum_cls: typing.Type[enum.Enum], formatter: typing.Callable[[typing.Any], str] | None = None
) -> list[tuple]:
    return [(opt.name, formatter(opt) if formatter else opt.value) for opt in enum_cls]


def values_from_enum(enum_cls: typing.Type[enum.Enum]) -> list[tuple]:
    return [(opt.value, opt.value) for opt in enum_cls]


def sanitize_pc_string(value: str | None) -> str | None:
    """
    Strips leading whitespaces and avoids empty strings in database.
    This filter may be set globally for any PCOptStringField but has not been tested on every form yet.
    """
    if value:
        value = value.strip()
    return value if value else None
