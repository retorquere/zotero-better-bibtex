# -*- coding: utf-8 -*-

from __future__ import absolute_import
from behave.formatter.plain import PlainFormatter
from behave.formatter.pretty import get_terminal_size
from behave.textutil import make_indentation
from behave.formatter.ansi_escapes import escapes
import textwrap
import os

# -----------------------------------------------------------------------------
# CLASS: PlainFormatter
# -----------------------------------------------------------------------------

class TravisFormatter(PlainFormatter):
    """
    Provides a simple plain formatter without coloring/formatting.
    The formatter displays now also:

       * multi-line text (doc-strings)
       * table
       * tags (maybe)
    """
    name = "CI log"
    description = "Very basic formatter with maximum compatibility but shortened line lengths for online CI environments"

    LINE_WIDTH = (130 if 'CI' in os.environ else max(get_terminal_size()[0], 130))
    SHOW_TAGS = True

    def write_tags(self, tags, indent=None):
      if tags and self.show_tags:
        indent = indent or ""

        text = textwrap.fill(' '.join(['@' + tag for tag in sorted(tags, key=lambda t: (t.rjust(10, '0').rjust(30, '~') if t.isdigit() else t))]), self.LINE_WIDTH, initial_indent=indent, subsequent_indent=indent + '  ')
        self.stream.write(text + '\n')

    def result(self, step):
        """
        Process the result of a step (after step execution).

        :param step:   Step object with result to process.
        """
        step = self.steps.pop(0)
        indent = make_indentation(2 * self.indent_size)
        if self.show_aligned_keywords:
            # -- RIGHT-ALIGN KEYWORDS (max. keyword width: 6):
            text = u"%s%6s %s" % (indent, step.keyword, step.name)
        else:
            text = u"%s%s %s" % (indent, step.keyword, step.name)
        text = escapes[step.status.name] + textwrap.shorten(text, width=self.LINE_WIDTH - 30) + escapes['reset'] + ' '
        self.stream.write(text)

        status_text = ': '
        if step.status.name == 'passed':
          status_text += u'\u2713'
        else:
          status_text += u'\u26A0'

        if self.show_timings:
            status_text += " in %0.3fs" % step.duration

        unicode_errors = 0
        if step.error_message:
            try:
                self.stream.write(u"%s\n%s\n" % (status_text, step.error_message))
            except UnicodeError as e:
                unicode_errors += 1
                self.stream.write(u"%s\n" % status_text)
                self.stream.write(u"%s while writing error message: %s\n" % \
                                  (e.__class__.__name__, e))
                if self.RAISE_OUTPUT_ERRORS:
                    raise
        else:
            self.stream.write(u"%s\n" % status_text)

        if self.show_multiline:
            if step.text:
                try:
                    self.doc_string(step.text)
                except UnicodeError as e:
                    unicode_errors += 1
                    self.stream.write(u"%s while writing docstring: %s\n" % \
                                      (e.__class__.__name__, e))
                    if self.RAISE_OUTPUT_ERRORS:
                        raise
            if step.table:
                self.table(step.table)

